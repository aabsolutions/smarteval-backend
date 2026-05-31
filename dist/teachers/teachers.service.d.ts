import { Model } from 'mongoose';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './schemas/teacher.schema';
import { UsersService } from '../users/users.service';
export declare class TeachersService {
    private teacherModel;
    private usersService;
    constructor(teacherModel: Model<Teacher>, usersService: UsersService);
    create(createTeacherDto: CreateTeacherDto): Promise<Teacher>;
    findAll(): Promise<Teacher[]>;
    findOne(id: string): Promise<Teacher>;
    update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher>;
    remove(id: string): Promise<Teacher>;
}
