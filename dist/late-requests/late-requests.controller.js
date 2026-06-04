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
exports.LateRequestsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const late_requests_service_1 = require("./late-requests.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const late_request_schema_1 = require("./late-request.schema");
let LateRequestsController = class LateRequestsController {
    constructor(lateRequestsService) {
        this.lateRequestsService = lateRequestsService;
    }
    async createRequest(req, teacherId, assessmentId, reason, files) {
        return this.lateRequestsService.createRequest(req.user.userId, teacherId, assessmentId, reason, files);
    }
    async updateRequest(req, id, reason, files) {
        return this.lateRequestsService.updateRequest(id, req.user.userId, reason, files);
    }
    async getStudentRequests(req) {
        return this.lateRequestsService.findByStudent(req.user.userId);
    }
    async getTeacherRequests(req) {
        return this.lateRequestsService.findByTeacher(req.user.userId);
    }
    async updateStatus(req, id, status, teacherComment, extensionUntil) {
        return this.lateRequestsService.updateStatus(id, req.user.userId, status, teacherComment, extensionUntil);
    }
    async cancelRequest(req, id) {
        return this.lateRequestsService.cancelRequest(id, req.user.userId);
    }
};
exports.LateRequestsController = LateRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('teacherId')),
    __param(2, (0, common_1.Body)('assessmentId')),
    __param(3, (0, common_1.Body)('reason')),
    __param(4, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Array]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Patch)(':id/update'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Array]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "updateRequest", null);
__decorate([
    (0, common_1.Get)('student'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "getStudentRequests", null);
__decorate([
    (0, common_1.Get)('teacher'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "getTeacherRequests", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)('TEACHER'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __param(3, (0, common_1.Body)('teacherComment')),
    __param(4, (0, common_1.Body)('extensionUntil')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LateRequestsController.prototype, "cancelRequest", null);
exports.LateRequestsController = LateRequestsController = __decorate([
    (0, common_1.Controller)('late-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [late_requests_service_1.LateRequestsService])
], LateRequestsController);
//# sourceMappingURL=late-requests.controller.js.map