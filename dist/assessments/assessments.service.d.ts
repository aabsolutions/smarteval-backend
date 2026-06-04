import { Model } from 'mongoose';
import { Assessment, AssessmentDocument } from './assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentsService } from '../students/students.service';
import { LateRequestDocument } from '../late-requests/late-request.schema';
export declare class AssessmentsService {
    private assessmentModel;
    private lateRequestModel;
    private notificationsService;
    private studentsService;
    constructor(assessmentModel: Model<AssessmentDocument>, lateRequestModel: Model<LateRequestDocument>, notificationsService: NotificationsService, studentsService: StudentsService);
    create(createDto: CreateAssessmentDto, teacherId: string): Promise<Assessment>;
    findAllByTeacher(teacherId: string): Promise<any[]>;
    findAvailableForStudent(studentGroupId: string): Promise<any[]>;
    findAvailableForStudentUser(username: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, teacherId: string, updateDto: any): Promise<Assessment>;
    allowLateStudent(assessmentId: string, studentId: string): Promise<void>;
    removeLateStudent(assessmentId: string, studentId: string): Promise<void>;
    delete(id: string, teacherId: string): Promise<any>;
}
