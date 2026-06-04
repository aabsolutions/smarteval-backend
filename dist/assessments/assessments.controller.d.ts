import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
export declare class AssessmentsController {
    private readonly assessmentsService;
    constructor(assessmentsService: AssessmentsService);
    create(createDto: CreateAssessmentDto, req: any): Promise<import("./assessment.schema").Assessment>;
    findAllByTeacher(req: any): Promise<any[]>;
    findAvailableForStudent(req: any): Promise<any[]>;
    debugStudent(req: any): Promise<{
        now: string;
        assessments: {
            _id: any;
            title: any;
            endTime: any;
            extensionUntil: any;
        }[];
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateAssessmentDto, req: any): Promise<import("./assessment.schema").Assessment>;
    remove(id: string, req: any): Promise<any>;
}
