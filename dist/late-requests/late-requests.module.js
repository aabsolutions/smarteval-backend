"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LateRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const late_requests_service_1 = require("./late-requests.service");
const late_requests_controller_1 = require("./late-requests.controller");
const late_request_schema_1 = require("./late-request.schema");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const notifications_module_1 = require("../notifications/notifications.module");
const assessments_module_1 = require("../assessments/assessments.module");
let LateRequestsModule = class LateRequestsModule {
};
exports.LateRequestsModule = LateRequestsModule;
exports.LateRequestsModule = LateRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: late_request_schema_1.LateRequest.name, schema: late_request_schema_1.LateRequestSchema }]),
            cloudinary_module_1.CloudinaryModule,
            notifications_module_1.NotificationsModule,
            assessments_module_1.AssessmentsModule
        ],
        controllers: [late_requests_controller_1.LateRequestsController],
        providers: [late_requests_service_1.LateRequestsService],
    })
], LateRequestsModule);
//# sourceMappingURL=late-requests.module.js.map