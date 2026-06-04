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
exports.LateRequestSchema = exports.LateRequest = exports.LateRequestStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var LateRequestStatus;
(function (LateRequestStatus) {
    LateRequestStatus["RECIBIDA"] = "RECIBIDA";
    LateRequestStatus["REVISANDO"] = "REVISANDO";
    LateRequestStatus["DEVUELTA"] = "DEVUELTA";
    LateRequestStatus["APROBADA"] = "APROBADA";
    LateRequestStatus["RECHAZADA"] = "RECHAZADA";
    LateRequestStatus["ANULADA"] = "ANULADA";
})(LateRequestStatus || (exports.LateRequestStatus = LateRequestStatus = {}));
let LateRequest = class LateRequest {
};
exports.LateRequest = LateRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], LateRequest.prototype, "studentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], LateRequest.prototype, "teacherId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Assessment', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], LateRequest.prototype, "assessmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], LateRequest.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LateRequest.prototype, "imageUrls", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], LateRequest.prototype, "imagePublicIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: LateRequestStatus, default: LateRequestStatus.RECIBIDA }),
    __metadata("design:type", String)
], LateRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], LateRequest.prototype, "teacherComment", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], LateRequest.prototype, "extensionUntil", void 0);
exports.LateRequest = LateRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], LateRequest);
exports.LateRequestSchema = mongoose_1.SchemaFactory.createForClass(LateRequest);
//# sourceMappingURL=late-request.schema.js.map