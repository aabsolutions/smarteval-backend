"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveQuizzesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const live_quiz_schema_1 = require("./schemas/live-quiz.schema");
const question_schema_1 = require("../questions/question.schema");
const live_quizzes_controller_1 = require("./live-quizzes.controller");
const live_quizzes_service_1 = require("./live-quizzes.service");
const live_quiz_gateway_1 = require("./live-quiz.gateway");
const auth_module_1 = require("../auth/auth.module");
const questions_module_1 = require("../questions/questions.module");
const users_module_1 = require("../users/users.module");
let LiveQuizzesModule = class LiveQuizzesModule {
};
exports.LiveQuizzesModule = LiveQuizzesModule;
exports.LiveQuizzesModule = LiveQuizzesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: live_quiz_schema_1.LiveQuiz.name, schema: live_quiz_schema_1.LiveQuizSchema },
                { name: question_schema_1.Question.name, schema: question_schema_1.QuestionSchema },
            ]),
            auth_module_1.AuthModule,
            questions_module_1.QuestionsModule,
            users_module_1.UsersModule,
        ],
        controllers: [live_quizzes_controller_1.LiveQuizzesController],
        providers: [live_quizzes_service_1.LiveQuizzesService, live_quiz_gateway_1.LiveQuizGateway],
        exports: [live_quizzes_service_1.LiveQuizzesService],
    })
], LiveQuizzesModule);
//# sourceMappingURL=live-quizzes.module.js.map