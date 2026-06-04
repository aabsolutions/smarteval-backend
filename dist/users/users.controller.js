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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(req, page = '1', limit = '10', search) {
        const userRole = req.user.roles[0].name;
        const allowedRoles = userRole === 'SUPERADMIN'
            ? ['SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT']
            : ['TEACHER', 'STUDENT'];
        return this.usersService.findAll(allowedRoles, parseInt(page), parseInt(limit), search);
    }
    async findOne(id, req) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
        return user;
    }
    async create(createUserDto, req) {
        const targetRole = createUserDto.roles[0]?.name;
        this.checkPermissions(req.user.roles[0].name, targetRole);
        return this.usersService.create(createUserDto);
    }
    async update(id, updateUserDto, req) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
        if (updateUserDto.roles && updateUserDto.roles.length > 0) {
            this.checkPermissions(req.user.roles[0].name, updateUserDto.roles[0].name);
        }
        return this.usersService.update(id, updateUserDto);
    }
    async remove(id, req) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
        return this.usersService.delete(id);
    }
    async resetPassword(id, req) {
        const user = await this.usersService.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        this.checkPermissions(req.user.roles[0].name, user.roles[0].name);
        return this.usersService.resetPassword(id);
    }
    async updateProfile(updateData, req) {
        const userId = req.user.userId || req.user.sub || req.user.id || req.user._id;
        delete updateData.roles;
        delete updateData.cedula;
        delete updateData.password;
        return this.usersService.update(userId, updateData);
    }
    async changePassword(passData, req) {
        const userId = req.user.userId || req.user.sub || req.user.id || req.user._id;
        return this.usersService.changePassword(userId, passData.currentPassword, passData.newPassword);
    }
    checkPermissions(requesterRole, targetRole) {
        if (requesterRole === 'SUPERADMIN') {
            return true;
        }
        if (requesterRole === 'ADMIN') {
            if (targetRole === 'SUPERADMIN' || targetRole === 'ADMIN') {
                throw new common_1.ForbiddenException(`ADMIN no puede gestionar usuarios con rol ${targetRole}`);
            }
            return true;
        }
        throw new common_1.ForbiddenException('No tienes permisos suficientes');
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Put)('me/profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('me/change-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map