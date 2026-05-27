import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
export declare class AssessmentsController {
    private readonly assessmentsService;
    constructor(assessmentsService: AssessmentsService);
    create(createDto: CreateAssessmentDto, req: any): Promise<import("./assessment.schema").Assessment>;
    findAllByTeacher(req: any): Promise<import("./assessment.schema").Assessment[]>;
    findAvailableForStudent(groupId: string): Promise<import("./assessment.schema").Assessment[]>;
    findOne(id: string): Promise<import("./assessment.schema").Assessment>;
    update(id: string, updateDto: UpdateAssessmentDto, req: any): Promise<import("./assessment.schema").Assessment>;
    remove(id: string, req: any): Promise<any>;
}
