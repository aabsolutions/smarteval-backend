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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const teacher_schema_1 = require("./schemas/teacher.schema");
const users_service_1 = require("../users/users.service");
let TeachersService = class TeachersService {
    constructor(teacherModel, usersService) {
        this.teacherModel = teacherModel;
        this.usersService = usersService;
    }
    async create(createTeacherDto) {
        if (!createTeacherDto.email || createTeacherDto.email.trim() === '') {
            delete createTeacherDto.email;
        }
        const query = [{ identifier: createTeacherDto.identifier }];
        if (createTeacherDto.email) {
            query.push({ email: createTeacherDto.email });
        }
        const existing = await this.teacherModel.findOne({ $or: query });
        if (existing) {
            throw new common_1.ConflictException('Ya existe un docente con ese identificador o email');
        }
        const existingUser = await this.usersService.findByUsername(createTeacherDto.identifier);
        if (existingUser) {
            throw new common_1.ConflictException('Ya existe un usuario con esa cédula en el sistema');
        }
        const userData = {
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
    async findAll() {
        return this.teacherModel.find().sort({ name: 1 }).exec();
    }
    async findOne(id) {
        const teacher = await this.teacherModel.findById(id).exec();
        if (!teacher)
            throw new common_1.NotFoundException(`Docente con ID ${id} no encontrado`);
        return teacher;
    }
    async update(id, updateTeacherDto) {
        const teacher = await this.teacherModel.findById(id).exec();
        if (!teacher)
            throw new common_1.NotFoundException(`Docente con ID ${id} no encontrado`);
        const oldIdentifier = teacher.identifier;
        const query = { $set: { ...updateTeacherDto } };
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
    async remove(id) {
        const deletedTeacher = await this.teacherModel.findByIdAndDelete(id).exec();
        if (!deletedTeacher)
            throw new common_1.NotFoundException(`Docente con ID ${id} no encontrado`);
        const user = await this.usersService.findByUsername(deletedTeacher.identifier);
        if (user) {
            await this.usersService.delete(user._id.toString());
        }
        return deletedTeacher;
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(teacher_schema_1.Teacher.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        users_service_1.UsersService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map