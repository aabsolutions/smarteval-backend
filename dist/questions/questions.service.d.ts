import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class QuestionsService {
    private questionModel;
    private cloudinaryService;
    constructor(questionModel: Model<QuestionDocument>, cloudinaryService: CloudinaryService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    private validateMatchingQuestion;
    create(createQuestionDto: CreateQuestionDto, teacherId: string): Promise<Question>;
    createBulk(questions: CreateQuestionDto[], teacherId: string): Promise<Question[]>;
    findAllByTeacher(teacherId: string, topicId?: string): Promise<Question[]>;
    findOne(id: string, teacherId: string): Promise<Question>;
    update(id: string, updateQuestionDto: UpdateQuestionDto, teacherId: string): Promise<Question>;
    remove(id: string, teacherId: string): Promise<Question>;
    removeBulk(ids: string[], teacherId: string): Promise<any>;
    updateBulkPoints(ids: string[], points: number, teacherId: string): Promise<any>;
}
