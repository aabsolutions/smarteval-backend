"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentAttemptsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const assessment_attempts_controller_1 = require("./assessment-attempts.controller");
const assessment_attempts_service_1 = require("./assessment-attempts.service");
const assessment_attempt_schema_1 = require("./assessment-attempt.schema");
const assessment_schema_1 = require("../assessments/assessment.schema");
const question_schema_1 = require("../questions/question.schema");
let AssessmentAttemptsModule = class AssessmentAttemptsModule {
};
exports.AssessmentAttemptsModule = AssessmentAttemptsModule;
exports.AssessmentAttemptsModule = AssessmentAttemptsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: assessment_attempt_schema_1.AssessmentAttempt.name, schema: assessment_attempt_schema_1.AssessmentAttemptSchema },
                { name: assessment_schema_1.Assessment.name, schema: assessment_schema_1.AssessmentSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema }
            ])
        ],
        controllers: [assessment_attempts_controller_1.AssessmentAttemptsController],
        providers: [assessment_attempts_service_1.AssessmentAttemptsService],
        exports: [assessment_attempts_service_1.AssessmentAttemptsService]
    })
], AssessmentAttemptsModule);
//# sourceMappingURL=assessment-attempts.module.js.map