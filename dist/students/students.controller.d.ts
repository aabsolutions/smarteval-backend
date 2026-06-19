import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    create(createStudentDto: CreateStudentDto): Promise<import("./schemas/student.schema").Student>;
    createBulk(createBulkDto: CreateBulkStudentsDto): Promise<import("./schemas/student.schema").Student[]>;
    findAll(): Promise<import("./schemas/student.schema").Student[]>;
    findOne(id: string): Promise<import("./schemas/student.schema").Student>;
    update(id: string, updateStudentDto: UpdateStudentDto): Promise<import("./schemas/student.schema").Student>;
    remove(id: string): Promise<import("./schemas/student.schema").Student>;
    resetPassword(id: string): Promise<any>;
}
