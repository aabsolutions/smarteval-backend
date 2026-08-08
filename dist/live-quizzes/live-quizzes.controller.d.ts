import { LiveQuizzesService } from './live-quizzes.service';
import { CreateLiveQuizDto } from './dto/create-live-quiz.dto';
import { UpdateLiveQuizDto } from './dto/update-live-quiz.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
export declare class LiveQuizzesController {
    private readonly liveQuizzesService;
    constructor(liveQuizzesService: LiveQuizzesService);
    create(createLiveQuizDto: CreateLiveQuizDto, req: any): Promise<import("./schemas/live-quiz.schema").LiveQuiz>;
    findAllByTeacher(req: any): Promise<import("./schemas/live-quiz.schema").LiveQuiz[]>;
    findOne(id: string, req: any): Promise<import("./schemas/live-quiz.schema").LiveQuiz>;
    update(id: string, updateLiveQuizDto: UpdateLiveQuizDto, req: any): Promise<import("./schemas/live-quiz.schema").LiveQuiz>;
    remove(id: string, req: any): Promise<void>;
    importQuestions(id: string, importDto: ImportQuestionsDto, req: any): Promise<import("./schemas/live-quiz.schema").LiveQuiz>;
}
