"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const student_schema_1 = require("./schemas/student.schema");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const assessment_attempts_service_1 = require("../assessment-attempts/assessment-attempts.service");
let StudentsService = class StudentsService {
    constructor(studentModel, usersService, notificationsService, assessmentAttemptsService) {
        this.studentModel = studentModel;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.assessmentAttemptsService = assessmentAttemptsService;
    }
    async create(createStudentDto) {
        if (!createStudentDto.email || createStudentDto.email.trim() === '') {
            delete createStudentDto.email;
        }
        const query = [{ identifier: createStudentDto.identifier }];
        if (createStudentDto.email) {
            query.push({ email: createStudentDto.email });
        }
        const existing = await this.studentModel.findOne({
            $or: query,
        });
        if (existing) {
            throw new common_1.ConflictException('Ya existe un estudiante con ese identificador o email');
        }
        const existingUser = await this.usersService.findByUsername(createStudentDto.identifier);
        if (existingUser) {
            throw new common_1.ConflictException('Ya existe un usuario con esa cédula en el sistema de acceso');
        }
        if (!createStudentDto.password) {
            throw new common_1.ConflictException('La contraseña es requerida para el alta inicial del estudiante');
        }
        const userData = {
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
        const createdStudent = new this.studentModel(createStudentDto);
        await createdStudent.save();
        await this.notificationsService.create(newUser._id.toString(), '¡Bienvenido a la Plataforma!', `Hola ${createStudentDto.name}. Tu usuario de acceso es tu cédula/código y tu contraseña es la que te ha asignado el administrador.`, 'INFO');
        return createdStudent;
    }
    async findAll() {
        return this.studentModel.find().populate('groupId', 'name').exec();
    }
    async findOne(id) {
        const student = await this.studentModel.findById(id).populate('groupId', 'name').exec();
        if (!student) {
            throw new common_1.NotFoundException(`Estudiante con ID ${id} no encontrado`);
        }
        return student;
    }
    async findByIdentifier(identifier) {
        return this.studentModel.findOne({ identifier }).populate('groupId', 'name').exec();
    }
    async findByIdentifiers(identifiers) {
        return this.studentModel.find({ identifier: { $in: identifiers } }).populate('groupId', 'name').exec();
    }
    async update(id, updateStudentDto) {
        const student = await this.studentModel.findById(id).exec();
        if (!student) {
            throw new common_1.NotFoundException(`Estudiante con ID ${id} no encontrado`);
        }
        const oldIdentifier = student.identifier;
        const query = { $set: { ...updateStudentDto } };
        if (updateStudentDto.email === '') {
            delete query.$set.email;
            query.$unset = { email: 1 };
        }
        const updatedStudent = await this.studentModel
            .findByIdAndUpdate(id, query, { new: true })
            .exec();
        if (updateStudentDto.identifier && updateStudentDto.identifier !== oldIdentifier) {
            const user = await this.usersService.findByUsername(oldIdentifier);
            if (user) {
                await this.usersService.update(user._id.toString(), { username: updateStudentDto.identifier });
            }
        }
        return updatedStudent;
    }
    async remove(id) {
        const deletedStudent = await this.studentModel.findByIdAndDelete(id).exec();
        if (!deletedStudent) {
            throw new common_1.NotFoundException(`Estudiante con ID ${id} no encontrado`);
        }
        const user = await this.usersService.findByUsername(deletedStudent.identifier);
        if (user) {
            const userIdStr = user._id.toString();
            await this.assessmentAttemptsService.removeAllForStudent(userIdStr);
            await this.notificationsService.removeAllForUser(userIdStr);
            await this.usersService.delete(userIdStr);
        }
        return deletedStudent;
    }
    async createBulk(createStudentDtos) {
        if (!createStudentDtos || createStudentDtos.length === 0) {
            throw new common_1.BadRequestException('No se proporcionaron estudiantes para crear');
        }
        const createdStudents = [];
        const errors = [];
        for (const [index, dto] of createStudentDtos.entries()) {
            try {
                if (!dto.password) {
                    dto.password = dto.identifier;
                }
                const student = await this.create(dto);
                createdStudents.push(student);
            }
            catch (error) {
                errors.push(`Error en la fila ${index + 1} (${dto.identifier}): ${error.message}`);
            }
        }
        if (errors.length > 0 && createdStudents.length === 0) {
            throw new common_1.BadRequestException(`Fallo la importación masiva:\n${errors.join('\n')}`);
        }
        else if (errors.length > 0) {
            console.warn(`Se importaron ${createdStudents.length} estudiantes con los siguientes errores:\n${errors.join('\n')}`);
        }
        return createdStudents;
    }
    async getUsersForGroups(groupIds) {
        const students = await this.studentModel.find({ groupId: { $in: groupIds } }).exec();
        const identifiers = students.map(s => s.identifier);
        const users = await this.usersService.findAll(['STUDENT'], 1, 10000);
        return users.data.filter(u => identifiers.includes(u.username));
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService,
        assessment_attempts_service_1.AssessmentAttemptsService])
], StudentsService);
//# sourceMappingURL=students.service.js.map