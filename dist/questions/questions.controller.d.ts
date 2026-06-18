import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateBulkQuestionsDto } from './dto/create-bulk-questions.dto';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    create(createQuestionDto: CreateQuestionDto, req: any): Promise<import("./question.schema").Question>;
    createBulk(createBulkDto: CreateBulkQuestionsDto, req: any): Promise<import("./question.schema").Question[]>;
    findAll(topicId: string, req: any): Promise<import("./question.schema").Question[]>;
    findOne(id: string, req: any): Promise<import("./question.schema").Question>;
    update(id: string, updateQuestionDto: UpdateQuestionDto, req: any): Promise<import("./question.schema").Question>;
    remove(id: string, req: any): Promise<import("./question.schema").Question>;
    updateBulkPoints(body: {
        ids: string[];
        points: number;
    }, req: any): Promise<any>;
    removeBulk(body: {
        ids: string[];
    }, req: any): Promise<any>;
}
