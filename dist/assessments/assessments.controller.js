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
exports.AssessmentsController = void 0;
const common_1 = require("@nestjs/common");
const assessments_service_1 = require("./assessments.service");
const create_assessment_dto_1 = require("./dto/create-assessment.dto");
const update_assessment_dto_1 = require("./dto/update-assessment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AssessmentsController = class AssessmentsController {
    constructor(assessmentsService) {
        this.assessmentsService = assessmentsService;
    }
    create(createDto, req) {
        return this.assessmentsService.create(createDto, req.user.userId);
    }
    findAllByTeacher(req) {
        return this.assessmentsService.findAllByTeacher(req.user.userId);
    }
    findAvailableForStudent(groupId) {
        if (groupId) {
            return this.assessmentsService.findAvailableForStudent(groupId);
        }
        return this.assessmentsService['assessmentModel'].find()
            .populate('topicId', 'name')
            .populate('teacherId', 'name')
            .exec();
    }
    findOne(id) {
        return this.assessmentsService.findOne(id);
    }
    update(id, updateDto, req) {
        return this.assessmentsService.update(id, req.user.userId, updateDto);
    }
    remove(id, req) {
        return this.assessmentsService.delete(id, req.user.userId);
    }
};
exports.AssessmentsController = AssessmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_assessment_dto_1.CreateAssessmentDto, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('teacher'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "findAllByTeacher", null);
__decorate([
    (0, common_1.Get)('student'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Query)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "findAvailableForStudent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN', 'SUPERADMIN', 'STUDENT'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_assessment_dto_1.UpdateAssessmentDto, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN', 'SUPERADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentsController.prototype, "remove", null);
exports.AssessmentsController = AssessmentsController = __decorate([
    (0, common_1.Controller)('assessments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [assessments_service_1.AssessmentsService])
], AssessmentsController);
//# sourceMappingURL=assessments.controller.js.map