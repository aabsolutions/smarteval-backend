import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LiveQuiz, LiveQuizStatus } from './schemas/live-quiz.schema';
import { CreateLiveQuizDto } from './dto/create-live-quiz.dto';
import { UpdateLiveQuizDto } from './dto/update-live-quiz.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { Question } from '../questions/question.schema';

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
      points: q.points,
      imageUrl: q.imageUrl,
      timeLimitSeconds: dto.defaultTimeLimitSeconds
    }));

    quiz.questions.push(...importedQuestions);
    return quiz.save();
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
