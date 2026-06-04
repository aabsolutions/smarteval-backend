"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const groups_module_1 = require("./groups/groups.module");
const students_module_1 = require("./students/students.module");
const topics_module_1 = require("./topics/topics.module");
const questions_module_1 = require("./questions/questions.module");
const assessments_module_1 = require("./assessments/assessments.module");
const assessment_attempts_module_1 = require("./assessment-attempts/assessment-attempts.module");
const notifications_module_1 = require("./notifications/notifications.module");
const institutions_module_1 = require("./institutions/institutions.module");
const teachers_module_1 = require("./teachers/teachers.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const late_requests_module_1 = require("./late-requests/late-requests.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                    maxPoolSize: 20,
                    minPoolSize: 5,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            groups_module_1.GroupsModule,
            students_module_1.StudentsModule,
            topics_module_1.TopicsModule,
            questions_module_1.QuestionsModule,
            assessments_module_1.AssessmentsModule,
            assessment_attempts_module_1.AssessmentAttemptsModule,
            notifications_module_1.NotificationsModule,
            institutions_module_1.InstitutionsModule,
            teachers_module_1.TeachersModule,
            cloudinary_module_1.CloudinaryModule,
            late_requests_module_1.LateRequestsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map