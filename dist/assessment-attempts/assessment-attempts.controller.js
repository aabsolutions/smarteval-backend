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
exports.AssessmentAttemptsController = void 0;
const common_1 = require("@nestjs/common");
const assessment_attempts_service_1 = require("./assessment-attempts.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AssessmentAttemptsController = class AssessmentAttemptsController {
    constructor(attemptsService) {
        this.attemptsService = attemptsService;
    }
    startAttempt(assessmentId, req) {
        return this.attemptsService.startAttempt(assessmentId, req.user.userId || req.user.sub);
    }
    submitAttempt(attemptId, answers, antiCheatLog, isTimeout, req) {
        return this.attemptsService.submitAttempt(attemptId, req.user.userId || req.user.sub, answers, antiCheatLog, isTimeout);
    }
    getStudentHistory(req) {
        return this.attemptsService.getStudentHistory(req.user.userId || req.user.sub);
    }
    getAttemptStatus(assessmentId, req) {
        return this.attemptsService.getAttemptStatus(assessmentId, req.user.userId || req.user.sub);
    }
    getAttemptDetails(attemptId, req) {
        return this.attemptsService.getAttemptDetails(attemptId, req.user.userId || req.user.sub);
    }
    archiveAttempt(id) {
        return this.attemptsService.archiveAttempt(id);
    }
    getArchivedAttempts(assessmentId) {
        return this.attemptsService.getArchivedAttempts(assessmentId);
    }
};
exports.AssessmentAttemptsController = AssessmentAttemptsController;
__decorate([
    (0, common_1.Post)('start/:assessmentId'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('assessmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "startAttempt", null);
__decorate([
    (0, common_1.Post)('submit/:attemptId'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Body)('answers')),
    __param(2, (0, common_1.Body)('antiCheatLog')),
    __param(3, (0, common_1.Body)('isTimeout')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object, Boolean, Object]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "submitAttempt", null);
__decorate([
    (0, common_1.Get)('student/history'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "getStudentHistory", null);
__decorate([
    (0, common_1.Get)('status/:assessmentId'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('assessmentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "getAttemptStatus", null);
__decorate([
    (0, common_1.Get)('details/:attemptId'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Param)('attemptId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "getAttemptDetails", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "archiveAttempt", null);
__decorate([
    (0, common_1.Get)(':assessmentId/archived'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('assessmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentAttemptsController.prototype, "getArchivedAttempts", null);
exports.AssessmentAttemptsController = AssessmentAttemptsController = __decorate([
    (0, common_1.Controller)('assessment-attempts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [assessment_attempts_service_1.AssessmentAttemptsService])
], AssessmentAttemptsController);
//# sourceMappingURL=assessment-attempts.controller.js.map