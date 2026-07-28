import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { AssessmentAttempt, AssessmentAttemptDocument, AttemptStatus, AttemptSource } from './assessment-attempt.schema';
import { Assessment, AssessmentDocument } from '../assessments/assessment.schema';
import { Question, QuestionDocument } from '../questions/question.schema';
import { LateRequest, LateRequestDocument, LateRequestStatus } from '../late-requests/late-request.schema';

@Injectable()
export class AssessmentAttemptsService {
  constructor(
    @InjectModel(AssessmentAttempt.name) private attemptModel: Model<AssessmentAttemptDocument>,
    @InjectModel(Assessment.name) private assessmentModel: Model<AssessmentDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(LateRequest.name) private lateRequestModel: Model<LateRequestDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private sanitizeAttempt(attempt: any): any {
    const attemptObj = attempt.toObject ? attempt.toObject() : attempt;
    if (attemptObj.status !== AttemptStatus.COMPLETED) {
      if (attemptObj.questionsPulled) {
        attemptObj.questionsPulled.forEach(q => {
          delete q.correctAnswers;
        });
      }
    }
    return attemptObj;
  }

  async startAttempt(assessmentId: string, studentId: string): Promise<AssessmentAttempt> {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    const now = new Date();
    if (now < assessment.startTime) {
      throw new BadRequestException('El examen aún no ha comenzado, revisa la fecha y hora de inicio.');
    }
    const approvedRequest = await this.lateRequestModel.findOne({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      status: LateRequestStatus.APROBADA
    });

    const isLateStudent = !!approvedRequest;
    
    if (!isLateStudent && now > assessment.endTime) {
      throw new BadRequestException('El plazo para rendir este examen ya ha finalizado.');
    }
    
    if (isLateStudent && approvedRequest.extensionUntil && now > approvedRequest.extensionUntil) {
      throw new BadRequestException('El plazo de tu extensión para rendir este examen ha expirado.');
    }

    const inProgress = await this.attemptModel.findOne({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      status: AttemptStatus.IN_PROGRESS
    });

    if (inProgress) {
      return inProgress;
    }

    const paperPending = await this.attemptModel.findOne({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      status: AttemptStatus.PAPER_PENDING,
      source: AttemptSource.PAPER
    });

    if (paperPending) {
      throw new BadRequestException('Tu evaluación fue asignada en formato papel.');
    }

    const previousAttempts = await this.attemptModel.countDocuments({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      isArchived: { $ne: true }
    });

    if (previousAttempts >= assessment.maxAttempts) {
      throw new BadRequestException(`Ya has alcanzado el máximo de intentos (${assessment.maxAttempts})`);
    }

    let randomQuestions;
    if (assessment.isCumulative && assessment.cumulativeQuestionIds && assessment.cumulativeQuestionIds.length > 0) {
      randomQuestions = await this.questionModel.find({
        _id: { $in: assessment.cumulativeQuestionIds }
      }).exec();
      
      // Shuffle the selected questions for anti-cheat randomness
      randomQuestions.sort(() => Math.random() - 0.5);
      if (assessment.totalQuestionsToPull && assessment.totalQuestionsToPull > 0) {
        randomQuestions = randomQuestions.slice(0, assessment.totalQuestionsToPull);
      }
    } else {
      const pipeline = [
        { $match: { topicId: assessment.topicId } },
        { $sample: { size: assessment.totalQuestionsToPull } }
      ];
      randomQuestions = await this.questionModel.aggregate(pipeline);
    }

    if (!randomQuestions || randomQuestions.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles para armar este examen');
    }

    let maxScore = 0;
    const snapshotQuestions = randomQuestions.map(q => {
      maxScore += q.points || 1;
      
      let options = q.options || [];
      let correctAnswers = q.correctAnswers || [];

      if (assessment.shuffleOptions && options.length > 0) {
        if (q.type !== 'matching') {
          options = [...options].sort(() => Math.random() - 0.5);
        }
      }

      let matchingOptions = [];
      if (q.type === 'matching' && correctAnswers.length > 0) {
        matchingOptions = [...correctAnswers];
        // Fisher-Yates shuffle for robust randomization of right column
        for (let i = matchingOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = matchingOptions[i];
          matchingOptions[i] = matchingOptions[j];
          matchingOptions[j] = temp;
        }
      }

      return {
        questionId: q._id.toString(),
        type: q.type,
        statement: q.statement,
        options: options,
        correctAnswers: correctAnswers,
        matchingOptions: matchingOptions,
        points: q.points || 1,
        imageUrl: q.imageUrl
      };
    });

    const newAttempt = new this.attemptModel({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      startTime: now,
      status: AttemptStatus.IN_PROGRESS,
      questionsPulled: snapshotQuestions,
      maxScore: maxScore
    });

    const savedAttempt = await newAttempt.save();
    return this.sanitizeAttempt(savedAttempt);
  }

  async getEligibleStudentsForPaper(assessmentId: string): Promise<any[]> {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    const StudentModel = this.connection.model('Student');
    const UserModel = this.connection.model('User');
    
    const students = await StudentModel.find({ groupId: { $in: assessment.groupIds } }).exec();
    const identifiers = students.map((s: any) => s.identifier);
    const users = await UserModel.find({ username: { $in: identifiers } }).exec();
    
    const userIds = users.map((u: any) => u._id);
    const existingAttempts = await this.attemptModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: { $in: userIds },
      isArchived: { $ne: true }
    }).select('studentId');

    const existingStudentIds = existingAttempts.map(a => a.studentId.toString());

    const eligibleUsers = users.filter((u: any) => !existingStudentIds.includes(u._id.toString()));

    const result = eligibleUsers.map((u: any) => ({
      _id: u._id,
      name: u.name,
      username: u.username,
      email: u.email
    }));

    result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return result;
  }

  async generatePaperAttempts(assessmentId: string, studentIds: string[]): Promise<AssessmentAttempt[]> {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Assessment not found');

    if (!studentIds || studentIds.length === 0) {
      const StudentModel = this.connection.model('Student');
      const UserModel = this.connection.model('User');
      
      const students = await StudentModel.find({ groupId: { $in: assessment.groupIds } }).exec();
      const identifiers = students.map((s: any) => s.identifier);
      const users = await UserModel.find({ username: { $in: identifiers } }).exec();
      studentIds = users.map((u: any) => u._id.toString());
    }

    const createdAttempts = [];
    for (const studentId of studentIds) {
      // Check if attempt exists
      const existing = await this.attemptModel.findOne({
        assessmentId: new Types.ObjectId(assessmentId),
        studentId: new Types.ObjectId(studentId),
        isArchived: { $ne: true }
      });
      if (existing) continue; // Skip if student already has an attempt

      let randomQuestions;
      if (assessment.isCumulative && assessment.cumulativeQuestionIds && assessment.cumulativeQuestionIds.length > 0) {
        randomQuestions = await this.questionModel.find({
          _id: { $in: assessment.cumulativeQuestionIds }
        }).exec();
        randomQuestions.sort(() => Math.random() - 0.5);
        if (assessment.totalQuestionsToPull && assessment.totalQuestionsToPull > 0) {
          randomQuestions = randomQuestions.slice(0, assessment.totalQuestionsToPull);
        }
      } else {
        const pipeline = [
          { $match: { topicId: assessment.topicId } },
          { $sample: { size: assessment.totalQuestionsToPull } }
        ];
        randomQuestions = await this.questionModel.aggregate(pipeline);
      }
      
      if (!randomQuestions || randomQuestions.length === 0) continue;

      let maxScore = 0;
      const snapshotQuestions = randomQuestions.map(q => {
        maxScore += q.points || 1;
        let options = q.options || [];
        let correctAnswers = q.correctAnswers || [];

        if (assessment.shuffleOptions && options.length > 0) {
          if (q.type !== 'matching') {
            options = [...options].sort(() => Math.random() - 0.5);
          }
        }

        let matchingOptions = [];
        if (q.type === 'matching' && correctAnswers.length > 0) {
          matchingOptions = [...correctAnswers];
          for (let i = matchingOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = matchingOptions[i];
            matchingOptions[i] = matchingOptions[j];
            matchingOptions[j] = temp;
          }
        }

        return {
          questionId: q._id.toString(),
          type: q.type,
          statement: q.statement,
          options: options,
          correctAnswers: correctAnswers,
          matchingOptions: matchingOptions,
          points: q.points || 1,
          imageUrl: q.imageUrl
        };
      });

      const newAttempt = new this.attemptModel({
        assessmentId: new Types.ObjectId(assessmentId),
        studentId: new Types.ObjectId(studentId),
        startTime: new Date(), // They will take it later, but we create it now
        status: AttemptStatus.PAPER_PENDING,
        source: AttemptSource.PAPER,
        questionsPulled: snapshotQuestions,
        maxScore: maxScore
      });

      const savedAttempt = await newAttempt.save();
      const populatedAttempt = await savedAttempt.populate('studentId', 'name username');
      createdAttempts.push(populatedAttempt);
    }
    return createdAttempts;
  }

  async submitPaperAttempt(
    attemptId: string, 
    studentId: string, 
    studentAnswers: { questionId: string, answers: string[] }[]
  ): Promise<AssessmentAttempt> {
    const attempt = await this.attemptModel.findOne({ 
      _id: attemptId, 
      studentId: new Types.ObjectId(studentId),
      source: AttemptSource.PAPER 
    }).populate('assessmentId');
    
    if (!attempt) throw new NotFoundException('Paper attempt not found');
    
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new BadRequestException('This attempt is already submitted');
    }

    const now = new Date();
    let score = 0;
    const answersMap = new Map();
    studentAnswers.forEach(sa => answersMap.set(sa.questionId, sa.answers));

    attempt.questionsPulled.forEach(q => {
      const sAns = answersMap.get(q.questionId) || [];
      let isCorrect = false;

      if (q.type === 'single-choice' || q.type === 'true-false') {
        if (sAns.length > 0 && q.correctAnswers.length > 0 && sAns[0] === q.correctAnswers[0]) {
          isCorrect = true;
        }
      } else if (q.type === 'multiple-choice') {
        if (sAns.length === q.correctAnswers.length) {
          const sortedS = [...sAns].sort();
          const sortedC = [...q.correctAnswers].sort();
          isCorrect = sortedS.every((val, index) => val === sortedC[index]);
        }
      } else if (q.type === 'fill-blank') {
        if (sAns.length > 0) {
          const normalizeStr = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
          const userAns = normalizeStr(sAns[0]);
          isCorrect = q.correctAnswers.some(c => normalizeStr(c) === userAns);
        }
      } else if (q.type === 'matching') {
        let correctPairs = 0;
        const totalPairs = q.correctAnswers.length;
        for (let i = 0; i < totalPairs; i++) {
          if (sAns[i] && sAns[i] === q.correctAnswers[i]) {
            correctPairs++;
          }
        }
        if (correctPairs > 0) {
          score += (correctPairs / totalPairs) * q.points;
          if (correctPairs === totalPairs) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect && q.type !== 'matching') {
        score += q.points;
      }
    });

    attempt.studentAnswers = studentAnswers;
    attempt.score = score;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.endTime = now;
    
    return attempt.save();
  }

  async submitAttempt(
    attemptId: string, 
    studentId: string, 
    studentAnswers: { questionId: string, answers: string[] }[],
    antiCheatLog?: any,
    isTimeout?: boolean
  ): Promise<AssessmentAttempt> {
    const attempt = await this.attemptModel.findOne({ _id: attemptId, studentId: new Types.ObjectId(studentId) }).populate('assessmentId');
    if (!attempt) throw new NotFoundException('Attempt not found');
    
    if (attempt.status === AttemptStatus.COMPLETED) {
      throw new BadRequestException('This attempt is already submitted');
    }

    const assessment = attempt.assessmentId as unknown as Assessment;
    const now = new Date();
    let outOfTime = false;

    // Validación estricta de tiempo (dejamos 5 minutos de gracia por latencia)
    if (assessment.durationMinutes) {
      const allowedTimeMs = (assessment.durationMinutes + 5) * 60 * 1000;
      const timeTakenMs = now.getTime() - attempt.startTime.getTime();
      if (timeTakenMs > allowedTimeMs) {
        outOfTime = true;
      }
    }

    let score = 0;
    const answersMap = new Map();
    studentAnswers.forEach(sa => answersMap.set(sa.questionId, sa.answers));

    attempt.questionsPulled.forEach(q => {
      const sAns = answersMap.get(q.questionId) || [];
      let isCorrect = false;

      if (q.type === 'single-choice' || q.type === 'true-false') {
        if (sAns.length > 0 && q.correctAnswers.length > 0 && sAns[0] === q.correctAnswers[0]) {
          isCorrect = true;
        }
      } else if (q.type === 'multiple-choice') {
        if (sAns.length === q.correctAnswers.length) {
          const sortedS = [...sAns].sort();
          const sortedC = [...q.correctAnswers].sort();
          isCorrect = sortedS.every((val, index) => val === sortedC[index]);
        }
      } else if (q.type === 'fill-blank') {
        if (sAns.length > 0) {
          const normalizeStr = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
          const userAns = normalizeStr(sAns[0]);
          isCorrect = q.correctAnswers.some(c => normalizeStr(c) === userAns);
        }
      } else if (q.type === 'matching') {
        let correctPairs = 0;
        const totalPairs = q.correctAnswers.length;
        // sAns length might be less if not fully answered, but we check by index
        for (let i = 0; i < totalPairs; i++) {
          if (sAns[i] && sAns[i] === q.correctAnswers[i]) {
            correctPairs++;
          }
        }
        if (correctPairs > 0) {
          score += (correctPairs / totalPairs) * q.points;
          if (correctPairs === totalPairs) {
            isCorrect = true;
          }
        }
      }

      if (isCorrect && q.type !== 'matching') {
        score += q.points;
      }
    });

    attempt.studentAnswers = studentAnswers;
    attempt.score = score;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.endTime = now;
    
    if (antiCheatLog) attempt.antiCheatLog = antiCheatLog;
    if (isTimeout) attempt.isTimeout = true;
    if (outOfTime) attempt.outOfTime = true;

    return attempt.save();
  }

  async getAttemptStatus(assessmentId: string, studentId: string): Promise<any> {
    const attempts = await this.attemptModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      isArchived: { $ne: true }
    }).sort({ createdAt: -1 }).exec();

    return {
      attemptsCount: attempts.length,
      history: attempts.map(a => this.sanitizeAttempt(a)),
      serverTime: new Date().toISOString()
    };
  }

  async getStudentHistory(studentId: string): Promise<any[]> {
    const attempts = await this.attemptModel.find({
      studentId: new Types.ObjectId(studentId),
      status: AttemptStatus.COMPLETED,
      isArchived: { $ne: true }
    })
    .sort({ endTime: -1 })
    .populate({
      path: 'assessmentId',
      select: 'title topicId flashcardUsages flashcardsTimeLimitMinutes',
      populate: {
        path: 'topicId',
        select: 'name'
      }
    })
    .lean()
    .exec();

    const processedAttempts = attempts.map((attempt: any) => {
      const assessment = attempt.assessmentId;
      const usage = assessment?.flashcardUsages?.find((u: any) => u.studentId.toString() === studentId.toString());
      return {
        ...attempt,
        usedFlashcards: !!usage,
        flashcardsTimeSeconds: usage ? usage.timeSpentSeconds : 0,
        flashcardsTimeLimitMinutes: assessment?.flashcardsTimeLimitMinutes || 0
      };
    });

    const bestAttemptsMap = new Map<string, any>();
    for (const attempt of processedAttempts) {
      const assessId = attempt.assessmentId?._id?.toString() || attempt.assessmentId?.toString();
      if (!assessId) continue;
      
      if (!bestAttemptsMap.has(assessId)) {
        bestAttemptsMap.set(assessId, attempt);
      } else {
        const existing = bestAttemptsMap.get(assessId);
        const currentScore = attempt.score / (attempt.maxScore || 1);
        const existingScore = existing.score / (existing.maxScore || 1);
        if (currentScore > existingScore) {
          bestAttemptsMap.set(assessId, attempt);
        }
      }
    }

    return Array.from(bestAttemptsMap.values()).sort((a, b) => {
      return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
    });
  }

  async getStudentHistoryByProfileId(studentProfileId: string): Promise<any[]> {
    const StudentModel = this.connection.model('Student');
    const UserModel = this.connection.model('User');

    const student = await StudentModel.findById(studentProfileId).exec();
    if (!student) throw new NotFoundException('Student profile not found');

    const user = await UserModel.findOne({ username: student.identifier }).exec();
    if (!user) {
      return [];
    }

    return this.getStudentHistory(user._id.toString());
  }

  async getAttemptsByAssessment(assessmentId: string, studentId: string): Promise<AssessmentAttempt[]> {
    return this.attemptModel.find({ 
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      isArchived: { $ne: true }
    }).sort({ createdAt: -1 }).exec();
  }

  async removeAllForStudent(studentId: string): Promise<any> {
    return this.attemptModel.deleteMany({ studentId: new Types.ObjectId(studentId) }).exec();
  }

  async getAttemptDetails(attemptId: string, studentId: string): Promise<any> {
    const attempt = await this.attemptModel.findOne({ _id: attemptId, studentId: new Types.ObjectId(studentId) }).populate('assessmentId').populate('studentId', 'name username email');
    if (!attempt) throw new NotFoundException('Attempt not found');
    return this.sanitizeAttempt(attempt);
  }

  async getAttemptDetailsForTeacher(attemptId: string): Promise<any> {
    const attempt = await this.attemptModel.findById(attemptId).populate('assessmentId').populate('studentId', 'name username email');
    if (!attempt) throw new NotFoundException('Attempt not found');
    return this.sanitizeAttempt(attempt);
  }

  async getPaperAttemptById(attemptId: string): Promise<AssessmentAttempt> {
    const attempt = await this.attemptModel.findOne({ 
      _id: attemptId, 
      source: AttemptSource.PAPER 
    }).populate('assessmentId').populate('studentId', 'name username email');
    
    if (!attempt) throw new NotFoundException('Paper attempt not found');
    return attempt;
  }

  async archiveAttempt(attemptId: string): Promise<AssessmentAttempt> {
    const attempt = await this.attemptModel.findById(attemptId);
    if (!attempt) throw new NotFoundException('Attempt not found');
    
    attempt.isArchived = true;
    return attempt.save();
  }

  async getArchivedAttempts(assessmentId: string): Promise<AssessmentAttempt[]> {
    return this.attemptModel.find({ 
      assessmentId: new Types.ObjectId(assessmentId),
      isArchived: true
    }).populate('studentId', 'name username email group').sort({ createdAt: -1 }).exec();
  }
}
