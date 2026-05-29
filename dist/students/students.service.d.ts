import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './schemas/student.schema';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssessmentAttemptsService } from '../assessment-attempts/assessment-attempts.service';
export declare class StudentsService {
    private studentModel;
    private usersService;
    private notificationsService;
    private assessmentAttemptsService;
    constructor(studentModel: Model<Student>, usersService: UsersService, notificationsService: NotificationsService, assessmentAttemptsService: AssessmentAttemptsService);
    create(createStudentDto: CreateStudentDto): Promise<Student>;
    findAll(): Promise<Student[]>;
    findOne(id: string): Promise<Student>;
    findByIdentifier(identifier: string): Promise<Student>;
    findByIdentifiers(identifiers: string[]): Promise<Student[]>;
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student>;
    remove(id: string): Promise<Student>;
    createBulk(createStudentDtos: CreateStudentDto[]): Promise<Student[]>;
    getUsersForGroups(groupIds: string[]): Promise<any[]>;
}
