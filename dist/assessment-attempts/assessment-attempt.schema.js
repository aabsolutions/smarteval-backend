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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentAttemptSchema = exports.AssessmentAttempt = exports.AttemptStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var AttemptStatus;
(function (AttemptStatus) {
    AttemptStatus["IN_PROGRESS"] = "in-progress";
    AttemptStatus["COMPLETED"] = "completed";
})(AttemptStatus || (exports.AttemptStatus = AttemptStatus = {}));
let SnapshotQuestion = class SnapshotQuestion {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SnapshotQuestion.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SnapshotQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], SnapshotQuestion.prototype, "statement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], SnapshotQuestion.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], SnapshotQuestion.prototype, "correctAnswers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], SnapshotQuestion.prototype, "matchingOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], SnapshotQuestion.prototype, "points", void 0);
SnapshotQuestion = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], SnapshotQuestion);
let StudentAnswer = class StudentAnswer {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], StudentAnswer.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], StudentAnswer.prototype, "answers", void 0);
StudentAnswer = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], StudentAnswer);
let AssessmentAttempt = class AssessmentAttempt {
};
exports.AssessmentAttempt = AssessmentAttempt;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Assessment', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AssessmentAttempt.prototype, "assessmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AssessmentAttempt.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AssessmentAttempt.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], AssessmentAttempt.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AttemptStatus, default: AttemptStatus.IN_PROGRESS }),
    __metadata("design:type", String)
], AssessmentAttempt.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SnapshotQuestion], required: true }),
    __metadata("design:type", Array)
], AssessmentAttempt.prototype, "questionsPulled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [StudentAnswer], default: [] }),
    __metadata("design:type", Array)
], AssessmentAttempt.prototype, "studentAnswers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssessmentAttempt.prototype, "score", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssessmentAttempt.prototype, "maxScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AssessmentAttempt.prototype, "antiCheatLog", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssessmentAttempt.prototype, "isTimeout", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssessmentAttempt.prototype, "outOfTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssessmentAttempt.prototype, "isArchived", void 0);
exports.AssessmentAttempt = AssessmentAttempt = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AssessmentAttempt);
exports.AssessmentAttemptSchema = mongoose_1.SchemaFactory.createForClass(AssessmentAttempt);
//# sourceMappingURL=assessment-attempt.schema.js.map