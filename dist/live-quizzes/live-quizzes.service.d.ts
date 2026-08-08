import { Model } from 'mongoose';
import { LiveQuiz } from './schemas/live-quiz.schema';
import { CreateLiveQuizDto } from './dto/create-live-quiz.dto';
import { UpdateLiveQuizDto } from './dto/update-live-quiz.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { Question } from '../questions/question.schema';
export declare class LiveQuizzesService {
    private liveQuizModel;
    private questionModel;
    constructor(liveQuizModel: Model<LiveQuiz>, questionModel: Model<Question>);
    create(createDto: CreateLiveQuizDto, teacherId: string): Promise<LiveQuiz>;
    findAllByTeacher(teacherId: string): Promise<LiveQuiz[]>;
    findOne(id: string): Promise<LiveQuiz>;
    findOneByTeacher(id: string, teacherId: string): Promise<LiveQuiz>;
    findByPin(pin: string): Promise<LiveQuiz>;
    update(id: string, updateDto: UpdateLiveQuizDto, teacherId: string): Promise<LiveQuiz>;
    delete(id: string, teacherId: string): Promise<void>;
    importQuestionsFromBank(quizId: string, dto: ImportQuestionsDto, teacherId: string): Promise<LiveQuiz>;
    generateUniquePin(): Promise<string>;
}
