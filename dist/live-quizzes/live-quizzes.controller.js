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
exports.LiveQuizzesController = void 0;
const common_1 = require("@nestjs/common");
const live_quizzes_service_1 = require("./live-quizzes.service");
const create_live_quiz_dto_1 = require("./dto/create-live-quiz.dto");
const update_live_quiz_dto_1 = require("./dto/update-live-quiz.dto");
const import_questions_dto_1 = require("./dto/import-questions.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let LiveQuizzesController = class LiveQuizzesController {
    constructor(liveQuizzesService) {
        this.liveQuizzesService = liveQuizzesService;
    }
    create(createLiveQuizDto, req) {
        return this.liveQuizzesService.create(createLiveQuizDto, req.user.userId);
    }
    findAllByTeacher(req) {
        return this.liveQuizzesService.findAllByTeacher(req.user.userId);
    }
    findOne(id, req) {
        return this.liveQuizzesService.findOneByTeacher(id, req.user.userId);
    }
    update(id, updateLiveQuizDto, req) {
        return this.liveQuizzesService.update(id, updateLiveQuizDto, req.user.userId);
    }
    remove(id, req) {
        return this.liveQuizzesService.delete(id, req.user.userId);
    }
    importQuestions(id, importDto, req) {
        return this.liveQuizzesService.importQuestionsFromBank(id, importDto, req.user.userId);
    }
};
exports.LiveQuizzesController = LiveQuizzesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_live_quiz_dto_1.CreateLiveQuizDto, Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('teacher'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "findAllByTeacher", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_live_quiz_dto_1.UpdateLiveQuizDto, Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/import-questions'),
    (0, roles_decorator_1.Roles)('TEACHER', 'ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, import_questions_dto_1.ImportQuestionsDto, Object]),
    __metadata("design:returntype", void 0)
], LiveQuizzesController.prototype, "importQuestions", null);
exports.LiveQuizzesController = LiveQuizzesController = __decorate([
    (0, common_1.Controller)('live-quizzes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [live_quizzes_service_1.LiveQuizzesService])
], LiveQuizzesController);
//# sourceMappingURL=live-quizzes.controller.js.map