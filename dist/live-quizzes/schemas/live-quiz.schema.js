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
exports.LiveQuizSchema = exports.LiveQuiz = exports.LiveQuizAnswer = exports.LiveQuizParticipant = exports.LiveQuizQuestion = exports.LiveQuizStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var LiveQuizStatus;
(function (LiveQuizStatus) {
    LiveQuizStatus["DRAFT"] = "draft";
    LiveQuizStatus["LOBBY"] = "lobby";
    LiveQuizStatus["IN_PROGRESS"] = "in-progress";
    LiveQuizStatus["BETWEEN_QUESTIONS"] = "between-questions";
    LiveQuizStatus["PODIUM"] = "podium";
    LiveQuizStatus["FINISHED"] = "finished";
})(LiveQuizStatus || (exports.LiveQuizStatus = LiveQuizStatus = {}));
let LiveQuizQuestion = class LiveQuizQuestion {
};
exports.LiveQuizQuestion = LiveQuizQuestion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LiveQuizQuestion.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LiveQuizQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LiveQuizQuestion.prototype, "statement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], LiveQuizQuestion.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], LiveQuizQuestion.prototype, "correctAnswers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], LiveQuizQuestion.prototype, "matchingOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], LiveQuizQuestion.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], LiveQuizQuestion.prototype, "imageUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 30 }),
    __metadata("design:type", Number)
], LiveQuizQuestion.prototype, "timeLimitSeconds", void 0);
exports.LiveQuizQuestion = LiveQuizQuestion = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], LiveQuizQuestion);
let LiveQuizParticipant = class LiveQuizParticipant {
};
exports.LiveQuizParticipant = LiveQuizParticipant;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LiveQuizParticipant.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LiveQuizParticipant.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LiveQuizParticipant.prototype, "totalScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LiveQuizParticipant.prototype, "correctAnswers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LiveQuizParticipant.prototype, "totalResponseTimeMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], LiveQuizParticipant.prototype, "currentStreak", void 0);
exports.LiveQuizParticipant = LiveQuizParticipant = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], LiveQuizParticipant);
let LiveQuizAnswer = class LiveQuizAnswer {
};
exports.LiveQuizAnswer = LiveQuizAnswer;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LiveQuizAnswer.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LiveQuizAnswer.prototype, "questionIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], LiveQuizAnswer.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], LiveQuizAnswer.prototype, "responseTimeMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], LiveQuizAnswer.prototype, "isCorrect", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], LiveQuizAnswer.prototype, "pointsAwarded", void 0);
exports.LiveQuizAnswer = LiveQuizAnswer = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], LiveQuizAnswer);
let LiveQuiz = class LiveQuiz extends mongoose_2.Document {
};
exports.LiveQuiz = LiveQuiz;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LiveQuiz.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LiveQuiz.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], LiveQuiz.prototype, "pin", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], LiveQuiz.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Group' }], default: [] }),
    __metadata("design:type", Array)
], LiveQuiz.prototype, "groupIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LiveQuizStatus, default: LiveQuizStatus.DRAFT }),
    __metadata("design:type", String)
], LiveQuiz.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [LiveQuizQuestion], required: true }),
    __metadata("design:type", Array)
], LiveQuiz.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [LiveQuizParticipant], default: [] }),
    __metadata("design:type", Array)
], LiveQuiz.prototype, "participants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [LiveQuizAnswer], default: [] }),
    __metadata("design:type", Array)
], LiveQuiz.prototype, "answers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: -1 }),
    __metadata("design:type", Number)
], LiveQuiz.prototype, "currentQuestionIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LiveQuiz.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LiveQuiz.prototype, "finishedAt", void 0);
exports.LiveQuiz = LiveQuiz = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LiveQuiz);
exports.LiveQuizSchema = mongoose_1.SchemaFactory.createForClass(LiveQuiz);
//# sourceMappingURL=live-quiz.schema.js.map