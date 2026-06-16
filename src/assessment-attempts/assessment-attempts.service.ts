import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssessmentAttempt, AssessmentAttemptDocument, AttemptStatus } from './assessment-attempt.schema';
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

    const previousAttempts = await this.attemptModel.countDocuments({
      assessmentId: new Types.ObjectId(assessmentId),
      studentId: new Types.ObjectId(studentId),
      isArchived: { $ne: true }
    });

    if (previousAttempts >= assessment.maxAttempts) {
      throw new BadRequestException(`Ya has alcanzado el máximo de intentos (${assessment.maxAttempts})`);
    }

    const pipeline = [
      { $match: { topicId: assessment.topicId } },
      { $sample: { size: assessment.totalQuestionsToPull } }
    ];

    const randomQuestions = await this.questionModel.aggregate(pipeline);

    if (randomQuestions.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles en este tema para armar el examen');
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
          const normalizeStr = (str: string) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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
      history: attempts.map(a => this.sanitizeAttempt(a))
    };
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
    const attempt = await this.attemptModel.findOne({ _id: attemptId, studentId: new Types.ObjectId(studentId) });
    if (!attempt) throw new NotFoundException('Attempt not found');
    return this.sanitizeAttempt(attempt);
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
