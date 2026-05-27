import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument, QuestionType } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private questionModel: Model<QuestionDocument>) {}

  private validateMatchingQuestion(type: QuestionType, options?: string[], correctAnswers?: string[]) {
    if (type === QuestionType.MATCHING) {
      if (!options || !correctAnswers || options.length !== correctAnswers.length) {
        throw new BadRequestException('Matching questions require options and correctAnswers to have the same length.');
      }
      if (options.length < 3) {
        throw new BadRequestException('Matching questions require at least 3 pairs.');
      }
    }
  }

  async create(createQuestionDto: CreateQuestionDto, teacherId: string): Promise<Question> {
    this.validateMatchingQuestion(createQuestionDto.type, createQuestionDto.options, createQuestionDto.correctAnswers);
    const createdQuestion = new this.questionModel({
      ...createQuestionDto,
      topicId: new Types.ObjectId(createQuestionDto.topicId),
      teacherId: new Types.ObjectId(teacherId),
    });
    return createdQuestion.save();
  }

  async createBulk(questions: CreateQuestionDto[], teacherId: string): Promise<Question[]> {
    questions.forEach(q => this.validateMatchingQuestion(q.type, q.options, q.correctAnswers));
    const questionsToInsert = questions.map(q => ({
      ...q,
      topicId: new Types.ObjectId(q.topicId),
      teacherId: new Types.ObjectId(teacherId),
    }));
    return this.questionModel.insertMany(questionsToInsert);
  }

  async findAllByTeacher(teacherId: string, topicId?: string): Promise<Question[]> {
    const filter: any = { teacherId: new Types.ObjectId(teacherId) };
    if (topicId) {
      filter.topicId = new Types.ObjectId(topicId);
    }
    return this.questionModel.find(filter).populate('topicId', 'name').exec();
  }

  async findOne(id: string, teacherId: string): Promise<Question> {
    const question = await this.questionModel.findOne({ _id: id, teacherId: new Types.ObjectId(teacherId) }).populate('topicId', 'name').exec();
    if (!question) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }
    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, teacherId: string): Promise<Question> {
    if (updateQuestionDto.type === QuestionType.MATCHING || updateQuestionDto.options || updateQuestionDto.correctAnswers) {
        // Validation during update is tricky if we don't have the full object, 
        // but let's assume update replaces options and correctAnswers together if they are matching
        if (updateQuestionDto.type === QuestionType.MATCHING) {
            this.validateMatchingQuestion(updateQuestionDto.type, updateQuestionDto.options, updateQuestionDto.correctAnswers);
        }
    }
    const dataToUpdate = { ...updateQuestionDto };
    if (dataToUpdate.topicId) {
      (dataToUpdate as any).topicId = new Types.ObjectId(dataToUpdate.topicId);
    }
    
    const updatedQuestion = await this.questionModel
      .findOneAndUpdate(
        { _id: id, teacherId: new Types.ObjectId(teacherId) },
        dataToUpdate,
        { new: true },
      )
      .exec();
    if (!updatedQuestion) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }
    return updatedQuestion;
  }

  async remove(id: string, teacherId: string): Promise<Question> {
    const deletedQuestion = await this.questionModel
      .findOneAndDelete({ _id: id, teacherId: new Types.ObjectId(teacherId) })
      .exec();
    if (!deletedQuestion) {
      throw new NotFoundException(`Question #${id} not found or unauthorized`);
    }
    return deletedQuestion;
  }
}
