import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from './schemas/teacher.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    private usersService: UsersService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    if (!createTeacherDto.email || createTeacherDto.email.trim() === '') {
      delete createTeacherDto.email;
    }

    const query: any[] = [{ identifier: createTeacherDto.identifier }];
    if (createTeacherDto.email) {
      query.push({ email: createTeacherDto.email });
    }

    const existing = await this.teacherModel.findOne({ $or: query });
    if (existing) {
      throw new ConflictException('Ya existe un docente con ese identificador o email');
    }

    const existingUser = await this.usersService.findByUsername(createTeacherDto.identifier);
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con esa cédula en el sistema');
    }

    const userData: any = {
      username: createTeacherDto.identifier,
      password: createTeacherDto.password || createTeacherDto.identifier,
      name: createTeacherDto.name,
      roles: [{ name: 'TEACHER', priority: 2 }],
      permissions: ['canRead', 'canEdit', 'canAdd'],
      avatar: 'teacher.jpg',
    };

    if (createTeacherDto.email) {
      userData.email = createTeacherDto.email;
    }

    await this.usersService.create(userData);

    const createdTeacher = new this.teacherModel(createTeacherDto);
    return createdTeacher.save();
  }

  async findAll(): Promise<Teacher[]> {
    return this.teacherModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.teacherModel.findById(id).exec();
    if (!teacher) throw new NotFoundException(`Docente con ID ${id} no encontrado`);
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.teacherModel.findById(id).exec();
    if (!teacher) throw new NotFoundException(`Docente con ID ${id} no encontrado`);

    const oldIdentifier = teacher.identifier;
    
    const query: any = { $set: { ...updateTeacherDto } };
    if (updateTeacherDto.email === '') {
      delete query.$set.email;
      query.$unset = { email: 1 };
    }
    
    const updatedTeacher = await this.teacherModel.findByIdAndUpdate(id, query, { new: true }).exec();

    if (updateTeacherDto.identifier && updateTeacherDto.identifier !== oldIdentifier) {
      const user = await this.usersService.findByUsername(oldIdentifier);
      if (user) {
        await this.usersService.update(user._id.toString(), { username: updateTeacherDto.identifier });
      }
    }

    return updatedTeacher;
  }

  async remove(id: string): Promise<Teacher> {
    const deletedTeacher = await this.teacherModel.findByIdAndDelete(id).exec();
    if (!deletedTeacher) throw new NotFoundException(`Docente con ID ${id} no encontrado`);

    const user = await this.usersService.findByUsername(deletedTeacher.identifier);
    if (user) {
      await this.usersService.delete(user._id.toString());
    }

    return deletedTeacher;
  }
}
