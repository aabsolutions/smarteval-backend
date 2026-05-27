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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async onModuleInit() {
        await this.seedUsers();
    }
    async findByUsername(username) {
        return this.userModel.findOne({ username }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).select('-password').exec();
    }
    async findAll(allowedRoles) {
        return this.userModel.find({ 'roles.name': { $in: allowedRoles } }).select('-password').exec();
    }
    async update(id, updateData) {
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const query = { $set: updateData };
        if (updateData.email === '') {
            delete query.$set.email;
            query.$unset = { email: 1 };
        }
        return this.userModel.findByIdAndUpdate(id, query, { new: true }).select('-password').exec();
    }
    async delete(id) {
        return this.userModel.findByIdAndDelete(id).exec();
    }
    async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const createdUser = new this.userModel({
            ...userData,
            password: hashedPassword,
        });
        return createdUser.save();
    }
    async seedUsers() {
        try {
            const userCount = await this.userModel.countDocuments();
            const superAdminCount = await this.userModel.countDocuments({ username: 'superadmin' });
            if (userCount > 0 && superAdminCount > 0) {
                console.log('La base de datos ya contiene usuarios y al superadmin. Saltando el seeding.');
                return;
            }
            console.log('Iniciando el seeding de usuarios con NestJS...');
            const initialUsers = [];
            if (superAdminCount === 0) {
                initialUsers.push({
                    username: 'superadmin',
                    password: await bcrypt.hash('superadmin@123', 10),
                    name: 'Super Admin',
                    email: 'superadmin@school.org',
                    roles: [{ name: 'SUPERADMIN', priority: 0 }],
                    permissions: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
                    avatar: 'admin.jpg',
                });
            }
            if (userCount === 0 || (userCount > 0 && superAdminCount === 0 && userCount <= 3)) {
                initialUsers.push({
                    username: 'admin',
                    password: await bcrypt.hash('admin@123', 10),
                    name: 'Sarah Smith',
                    email: 'admin@school.org',
                    roles: [{ name: 'ADMIN', priority: 1 }],
                    permissions: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
                    avatar: 'admin.jpg',
                }, {
                    username: 'teacher',
                    password: await bcrypt.hash('teacher@123', 10),
                    name: 'Ashton Cox',
                    email: 'teacher@school.org',
                    roles: [{ name: 'TEACHER', priority: 2 }],
                    permissions: ['canAdd', 'canEdit', 'canRead'],
                    avatar: 'teacher.jpg',
                }, {
                    username: 'student',
                    password: await bcrypt.hash('student@123', 10),
                    name: 'Cara Stevens',
                    email: 'student@school.org',
                    roles: [{ name: 'STUDENT', priority: 3 }],
                    permissions: ['canRead'],
                    avatar: 'student.jpg',
                });
            }
            await this.userModel.insertMany(initialUsers);
            console.log('Usuarios iniciales de NestJS creados/actualizados con éxito');
        }
        catch (error) {
            console.error('Error al sembrar usuarios en NestJS:', error);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map