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
exports.QuestionSchema = exports.Question = exports.QuestionType = exports.QuestionDifficulty = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var QuestionDifficulty;
(function (QuestionDifficulty) {
    QuestionDifficulty["EASY"] = "easy";
    QuestionDifficulty["MEDIUM"] = "medium";
    QuestionDifficulty["HARD"] = "hard";
})(QuestionDifficulty || (exports.QuestionDifficulty = QuestionDifficulty = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["SINGLE_CHOICE"] = "single-choice";
    QuestionType["MULTIPLE_CHOICE"] = "multiple-choice";
    QuestionType["TRUE_FALSE"] = "true-false";
    QuestionType["FILL_BLANK"] = "fill-blank";
    QuestionType["MATCHING"] = "matching";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
let Question = class Question {
};
exports.Question = Question;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QuestionType, default: QuestionType.SINGLE_CHOICE }),
    __metadata("design:type", String)
], Question.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Question.prototype, "statement", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], Question.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], Question.prototype, "correctAnswers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Question.prototype, "points", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: QuestionDifficulty, default: QuestionDifficulty.MEDIUM }),
    __metadata("design:type", String)
], Question.prototype, "difficulty", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Topic', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "topicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Question.prototype, "teacherId", void 0);
exports.Question = Question = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Question);
exports.QuestionSchema = mongoose_1.SchemaFactory.createForClass(Question);
//# sourceMappingURL=question.schema.js.map