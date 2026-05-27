"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const assessments_controller_1 = require("./assessments.controller");
const assessments_service_1 = require("./assessments.service");
const assessment_schema_1 = require("./assessment.schema");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const assessment_attempt_schema_1 = require("../assessment-attempts/assessment-attempt.schema");
const students_module_1 = require("../students/students.module");
const notifications_module_1 = require("../notifications/notifications.module");
let AssessmentsModule = class AssessmentsModule {
};
exports.AssessmentsModule = AssessmentsModule;
exports.AssessmentsModule = AssessmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: assessment_schema_1.Assessment.name, schema: assessment_schema_1.AssessmentSchema },
                { name: assessment_attempt_schema_1.AssessmentAttempt.name, schema: assessment_attempt_schema_1.AssessmentAttemptSchema }
            ]),
            students_module_1.StudentsModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [assessments_controller_1.AssessmentsController, reports_controller_1.ReportsController],
        providers: [assessments_service_1.AssessmentsService, reports_service_1.ReportsService],
        exports: [assessments_service_1.AssessmentsService]
    })
], AssessmentsModule);
//# sourceMappingURL=assessments.module.js.map