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
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const teachers_service_1 = require("./teachers.service");
const create_teacher_dto_1 = require("./dto/create-teacher.dto");
const update_teacher_dto_1 = require("./dto/update-teacher.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let TeachersController = class TeachersController {
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    create(createTeacherDto) {
        return this.teachersService.create(createTeacherDto);
    }
    findAll() {
        return this.teachersService.findAll();
    }
    findOne(id) {
        return this.teachersService.findOne(id);
    }
    update(id, updateTeacherDto) {
        return this.teachersService.update(id, updateTeacherDto);
    }
    remove(id) {
        return this.teachersService.remove(id);
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_teacher_dto_1.CreateTeacherDto]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN', 'TEACHER'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_teacher_dto_1.UpdateTeacherDto]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)('SUPERADMIN', 'ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TeachersController.prototype, "remove", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.Controller)('teachers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map