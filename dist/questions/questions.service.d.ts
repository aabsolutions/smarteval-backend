import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
export declare class QuestionsService {
    private questionModel;
    constructor(questionModel: Model<QuestionDocument>);
    private validateMatchingQuestion;
    create(createQuestionDto: CreateQuestionDto, teacherId: string): Promise<Question>;
    createBulk(questions: CreateQuestionDto[], teacherId: string): Promise<Question[]>;
    findAllByTeacher(teacherId: string, topicId?: string): Promise<Question[]>;
    findOne(id: string, teacherId: string): Promise<Question>;
    update(id: string, updateQuestionDto: UpdateQuestionDto, teacherId: string): Promise<Question>;
    remove(id: string, teacherId: string): Promise<Question>;
}
