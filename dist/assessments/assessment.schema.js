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
exports.AssessmentSchema = exports.Assessment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Assessment = class Assessment {
};
exports.Assessment = Assessment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Assessment.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Assessment.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Topic', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Assessment.prototype, "topicId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Assessment.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Group' }], required: true }),
    __metadata("design:type", Array)
], Assessment.prototype, "groupIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Assessment.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Assessment.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Assessment.prototype, "durationMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Assessment.prototype, "totalQuestionsToPull", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Assessment.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Assessment.prototype, "antiCheat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Assessment.prototype, "shuffleOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Assessment.prototype, "maxAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Assessment.prototype, "isSimulator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Assessment.prototype, "allowedLateStudents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Assessment.prototype, "flashcardsTimeLimitMinutes", void 0);
exports.Assessment = Assessment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Assessment);
exports.AssessmentSchema = mongoose_1.SchemaFactory.createForClass(Assessment);
//# sourceMappingURL=assessment.schema.js.map