import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './schemas/student.schema';
import { UsersService } from '../users/users.service';

import { NotificationsService } from '../notifications/notifications.service';
import { AssessmentAttemptsService } from '../assessment-attempts/assessment-attempts.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private assessmentAttemptsService: AssessmentAttemptsService
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Si el email viene vacío, lo eliminamos completamente para evitar error de índice único en MongoDB
    if (!createStudentDto.email || createStudentDto.email.trim() === '') {
      delete createStudentDto.email;
    }

    const query: any[] = [{ identifier: createStudentDto.identifier }];
    if (createStudentDto.email) {
      query.push({ email: createStudentDto.email });
    }

    const existing = await this.studentModel.findOne({
      $or: query,
    });

    if (existing) {
      throw new ConflictException('Ya existe un estudiante con ese identificador o email');
    }

    const existingUser = await this.usersService.findByUsername(createStudentDto.identifier);
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con esa cédula en el sistema de acceso');
    }

    if (!createStudentDto.password) {
      throw new ConflictException('La contraseña es requerida para el alta inicial del estudiante');
    }

    const userData: any = {
      username: createStudentDto.identifier,
      password: createStudentDto.password,
      name: createStudentDto.name,
      roles: [{ name: 'STUDENT', priority: 3 }],
      permissions: ['canRead'],
      avatar: 'student.jpg',
    };

    if (createStudentDto.email) {
      userData.email = createStudentDto.email;
    }

    const newUser = await this.usersService.create(userData);

    // Prevent saving plain text password in the student collection
    const { password, ...studentData } = createStudentDto;
    const createdStudent = new this.studentModel(studentData);
    await createdStudent.save();

    // Enviar notificación in-app de bienvenida
    await this.notificationsService.create(
      newUser._id.toString(),
      '¡Bienvenido a la Plataforma!',
      `Hola ${createStudentDto.name}. Tu usuario de acceso es tu cédula/código y tu contraseña es la que te ha asignado el administrador.`,
      'INFO'
    );

    return createdStudent;
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().populate({ path: 'groupId', select: 'name institution nivel', populate: { path: 'institution', select: 'name' } }).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentModel.findById(id).populate({ path: 'groupId', select: 'name institution nivel', populate: { path: 'institution', select: 'name' } }).exec();
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }
    return student;
  }

  async findByIdentifier(identifier: string): Promise<Student> {
    return this.studentModel.findOne({ identifier }).populate({ path: 'groupId', select: 'name institution nivel', populate: { path: 'institution', select: 'name' } }).exec();
  }

  async findByIdentifiers(identifiers: string[]): Promise<Student[]> {
    return this.studentModel.find({ identifier: { $in: identifiers } }).populate({ path: 'groupId', select: 'name institution nivel', populate: { path: 'institution', select: 'name' } }).exec();
  }



  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentModel.findById(id).exec();
    if (!student) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    const oldIdentifier = student.identifier;
    
    const query: any = { $set: { ...updateStudentDto } };
    
    if (updateStudentDto.email === '') {
      delete query.$set.email;
      query.$unset = { email: 1 };
    }
    
    const updatedStudent = await this.studentModel
      .findByIdAndUpdate(id, query, { new: true })
      .exec();

    // Sincronizar el identifier de acceso si cambió
    if (updateStudentDto.identifier && updateStudentDto.identifier !== oldIdentifier) {
      const user = await this.usersService.findByUsername(oldIdentifier);
      if (user) {
        await this.usersService.update(user._id.toString(), { username: updateStudentDto.identifier });
      }
    }

    return updatedStudent;
  }

  async remove(id: string): Promise<Student> {
    const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
    if (!deletedStudent) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    // Al eliminar el estudiante, intentamos eliminar su usuario de acceso y sus rastros
    const user = await this.usersService.findByUsername(deletedStudent.identifier);
    if (user) {
      const userIdStr = user._id.toString();
      
      // Limpiar rastros (borrado en cascada)
      await this.assessmentAttemptsService.removeAllForStudent(userIdStr);
      await this.notificationsService.removeAllForUser(userIdStr);
      
      // Eliminar el usuario en sí
      await this.usersService.delete(userIdStr);
    }

    return deletedStudent;
  }

  async createBulk(createStudentDtos: CreateStudentDto[]): Promise<Student[]> {
    if (!createStudentDtos || createStudentDtos.length === 0) {
      throw new BadRequestException('No se proporcionaron estudiantes para crear');
    }

    const createdStudents: Student[] = [];
    const errors: string[] = [];

    for (const [index, dto] of createStudentDtos.entries()) {
      try {
        if (!dto.password) {
          dto.password = dto.identifier;
        }
        const student = await this.create(dto);
        createdStudents.push(student);
      } catch (error) {
        errors.push(`Error en la fila ${index + 1} (${dto.identifier}): ${error.message}`);
      }
    }

    if (errors.length > 0 && createdStudents.length === 0) {
      throw new BadRequestException(`Fallo la importación masiva:\n${errors.join('\n')}`);
    } else if (errors.length > 0) {
      console.warn(`Se importaron ${createdStudents.length} estudiantes con los siguientes errores:\n${errors.join('\n')}`);
    }

    return createdStudents;
  }

  async getUsersForGroups(groupIds: string[]): Promise<any[]> {
    const students = await this.studentModel.find({ groupId: { $in: groupIds } }).exec();
    const identifiers = students.map(s => s.identifier);
    const users = await this.usersService.findAll(['STUDENT'], 1, 10000);
    return users.data.filter(u => identifiers.includes(u.username));
  }

  async resetPassword(id: string): Promise<any> {
    const student = await this.findOne(id);
    const user = await this.usersService.findByUsername(student.identifier);
    if (!user) {
      throw new NotFoundException('Usuario de acceso no encontrado para este estudiante');
    }
    return this.usersService.resetPassword(user._id.toString());
  }
}
