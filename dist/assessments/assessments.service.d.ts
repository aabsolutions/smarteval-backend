import { Model } from 'mongoose';
import { Assessment, AssessmentDocument } from './assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentsService } from '../students/students.service';
export declare class AssessmentsService {
    private assessmentModel;
    private notificationsService;
    private studentsService;
    constructor(assessmentModel: Model<AssessmentDocument>, notificationsService: NotificationsService, studentsService: StudentsService);
    create(createDto: CreateAssessmentDto, teacherId: string): Promise<Assessment>;
    findAllByTeacher(teacherId: string): Promise<Assessment[]>;
    findAvailableForStudent(studentGroupId: string): Promise<Assessment[]>;
    findAvailableForStudentUser(username: string): Promise<Assessment[]>;
    findOne(id: string): Promise<Assessment>;
    update(id: string, teacherId: string, updateDto: any): Promise<Assessment>;
    delete(id: string, teacherId: string): Promise<any>;
}
