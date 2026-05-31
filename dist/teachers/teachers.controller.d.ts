import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    create(createTeacherDto: CreateTeacherDto): Promise<import("./schemas/teacher.schema").Teacher>;
    findAll(): Promise<import("./schemas/teacher.schema").Teacher[]>;
    findOne(id: string): Promise<import("./schemas/teacher.schema").Teacher>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<import("./schemas/teacher.schema").Teacher>;
    remove(id: string): Promise<import("./schemas/teacher.schema").Teacher>;
}
