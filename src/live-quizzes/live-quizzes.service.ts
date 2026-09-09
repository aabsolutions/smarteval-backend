import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LiveQuiz, LiveQuizStatus } from './schemas/live-quiz.schema';
import { CreateLiveQuizDto } from './dto/create-live-quiz.dto';
import { UpdateLiveQuizDto } from './dto/update-live-quiz.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { Question } from '../questions/question.schema';
import { generateRanking } from './live-quiz-scoring.util';

@Injectable()
export class LiveQuizzesService {
  constructor(
    @InjectModel(LiveQuiz.name) private liveQuizModel: Model<LiveQuiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createDto: CreateLiveQuizDto, teacherId: string): Promise<LiveQuiz> {
    const pin = await this.generateUniquePin();
    
    const createdQuiz = new this.liveQuizModel({
      ...createDto,
      teacherId: new Types.ObjectId(teacherId),
      pin,
      status: LiveQuizStatus.DRAFT,
      participants: [],
      answers: [],
      currentQuestionIndex: -1,
      groupIds: createDto.groupIds ? createDto.groupIds.map(id => new Types.ObjectId(id)) : [],
    });
    
    return createdQuiz.save();
  }

  async findAllByTeacher(teacherId: string): Promise<LiveQuiz[]> {
    return this.liveQuizModel.find({ teacherId: new Types.ObjectId(teacherId) }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<LiveQuiz> {
    const quiz = await this.liveQuizModel.findById(id).populate('groupIds').exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz con ID ${id} no encontrado`);
    }
    return quiz;
  }
  
  async findOneByTeacher(id: string, teacherId: string): Promise<LiveQuiz> {
    const quiz = await this.findOne(id);
    if (quiz.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('No tienes permiso para acceder a este quiz');
    }
    return quiz;
  }

  async findByPin(pin: string): Promise<LiveQuiz> {
    const quiz = await this.liveQuizModel.findOne({ pin, status: { $ne: LiveQuizStatus.FINISHED } }).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz con PIN ${pin} no encontrado o ya finalizó`);
    }
    return quiz;
  }

  async update(id: string, updateDto: UpdateLiveQuizDto, teacherId: string): Promise<LiveQuiz> {
    const quiz = await this.findOneByTeacher(id, teacherId);
    
    if (quiz.status !== LiveQuizStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden actualizar quizzes en estado DRAFT');
    }

    Object.assign(quiz, updateDto);
    if (updateDto.groupIds) {
      quiz.groupIds = updateDto.groupIds.map(gid => new Types.ObjectId(gid));
    }
    
    return quiz.save();
  }

  async delete(id: string, teacherId: string): Promise<void> {
    const quiz = await this.findOneByTeacher(id, teacherId);
    
    // Eliminado: La restricción de que solo se pueden borrar DRAFT o FINISHED, 
    // para permitir al docente limpiar partidas abandonadas.
    
    await this.liveQuizModel.deleteOne({ _id: id }).exec();
  }

  async importQuestionsFromBank(quizId: string, dto: ImportQuestionsDto, teacherId: string): Promise<LiveQuiz> {
    const quiz = await this.findOneByTeacher(quizId, teacherId);
    
    if (quiz.status !== LiveQuizStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden importar preguntas en estado DRAFT');
    }

    const questionsFromBank = await this.questionModel.find({
      _id: { $in: dto.questionIds.map(id => new Types.ObjectId(id)) },
      teacherId: new Types.ObjectId(teacherId)
    }).exec();

    const importedQuestions = questionsFromBank.map(q => ({
      questionId: q._id.toString(),
      type: q.type,
      statement: q.statement,
      options: q.options,
      correctAnswers: q.correctAnswers,
      // Para matching, el banco no guarda un orden de exhibición separado:
      // barajamos acá una copia de correctAnswers para mostrar como columna
      // derecha, sin revelar el orden correcto (mismo criterio que assessment-attempts).
      matchingOptions: q.type === 'matching' ? this.shuffle([...q.correctAnswers]) : undefined,
      points: q.points,
      imageUrl: q.imageUrl,
      timeLimitSeconds: dto.defaultTimeLimitSeconds
    }));

    quiz.questions.push(...importedQuestions);
    return quiz.save();
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async getReport(id: string, teacherId: string) {
    const quiz = await this.findOneByTeacher(id, teacherId);

    if (quiz.status !== LiveQuizStatus.FINISHED) {
      throw new BadRequestException('El reporte solo está disponible para quizzes finalizados');
    }

    const ranking = generateRanking(quiz.participants.map(p => ({
      userId: p.userId.toString(),
      name: p.name,
      totalScore: p.totalScore,
      correctAnswers: p.correctAnswers,
      totalResponseTimeMs: p.totalResponseTimeMs,
    })));

    const perQuestion = quiz.questions.map((q, index) => {
      const questionAnswers = quiz.answers.filter(a => a.questionIndex === index);
      const correctCount = questionAnswers.filter(a => a.isCorrect).length;

      return {
        questionIndex: index,
        statement: q.statement,
        type: q.type,
        totalAnswered: questionAnswers.length,
        correctCount,
        correctPercentage: questionAnswers.length ? (correctCount / questionAnswers.length) * 100 : 0,
        averageResponseTimeMs: questionAnswers.length
          ? questionAnswers.reduce((sum, a) => sum + a.responseTimeMs, 0) / questionAnswers.length
          : 0,
      };
    });

    return {
      quizId: quiz._id,
      title: quiz.title,
      startedAt: quiz.startedAt,
      finishedAt: quiz.finishedAt,
      totalQuestions: quiz.questions.length,
      totalParticipants: quiz.participants.length,
      ranking,
      perQuestion,
    };
  }

  async generateUniquePin(): Promise<string> {
    let pin: string;
    let exists = true;
    while (exists) {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await this.liveQuizModel.findOne({
        pin,
        status: { $nin: [LiveQuizStatus.FINISHED] },
      }).exec();
      exists = !!existing;
    }
    return pin;
  }
}
