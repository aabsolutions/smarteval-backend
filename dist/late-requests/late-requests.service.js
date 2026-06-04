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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LateRequestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const late_request_schema_1 = require("./late-request.schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const notifications_service_1 = require("../notifications/notifications.service");
const assessments_service_1 = require("../assessments/assessments.service");
let LateRequestsService = class LateRequestsService {
    constructor(lateRequestModel, cloudinaryService, notificationsService, assessmentsService) {
        this.lateRequestModel = lateRequestModel;
        this.cloudinaryService = cloudinaryService;
        this.notificationsService = notificationsService;
        this.assessmentsService = assessmentsService;
    }
    async createRequest(studentId, teacherId, assessmentId, reason, files) {
        if (!teacherId || !assessmentId || !reason) {
            throw new common_1.BadRequestException('Faltan datos obligatorios');
        }
        const imageUrls = [];
        const imagePublicIds = [];
        if (files && files.length > 0) {
            for (const file of files) {
                const uploadResult = await this.cloudinaryService.uploadImage(file);
                imageUrls.push(uploadResult.secure_url);
                imagePublicIds.push(uploadResult.public_id);
            }
        }
        const newRequest = new this.lateRequestModel({
            studentId: new mongoose_2.Types.ObjectId(studentId),
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
            assessmentId: new mongoose_2.Types.ObjectId(assessmentId),
            reason,
            imageUrls,
            imagePublicIds,
        });
        const saved = await newRequest.save();
        const assessment = await this.assessmentsService.findOne(assessmentId);
        await this.notificationsService.create(teacherId, 'Nueva Solicitud de Examen Atrasado', `Un estudiante ha solicitado rendir el examen "${assessment.title}". Revisa la bandeja de solicitudes.`, 'INFO');
        return saved;
    }
    async updateRequest(id, studentId, reason, files) {
        const request = await this.lateRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        if (request.studentId.toString() !== studentId)
            throw new common_1.ForbiddenException('No autorizado');
        if (request.status !== late_request_schema_1.LateRequestStatus.DEVUELTA && request.status !== late_request_schema_1.LateRequestStatus.RECIBIDA) {
            throw new common_1.BadRequestException('Solo se pueden modificar solicitudes en estado DEVUELTA o RECIBIDA');
        }
        if (reason)
            request.reason = reason;
        if (files && files.length > 0) {
            const imageUrls = [];
            const imagePublicIds = [];
            for (const file of files) {
                const uploadResult = await this.cloudinaryService.uploadImage(file);
                imageUrls.push(uploadResult.secure_url);
                imagePublicIds.push(uploadResult.public_id);
            }
            if (request.imagePublicIds && request.imagePublicIds.length > 0) {
                for (const pubId of request.imagePublicIds) {
                    try {
                        await this.cloudinaryService.deleteImage(pubId);
                    }
                    catch (e) { }
                }
            }
            request.imageUrls = imageUrls;
            request.imagePublicIds = imagePublicIds;
        }
        request.status = late_request_schema_1.LateRequestStatus.RECIBIDA;
        const saved = await request.save();
        await this.notificationsService.create(request.teacherId.toString(), 'Solicitud Modificada', `El estudiante ha modificado su solicitud de examen atrasado.`, 'INFO');
        return saved;
    }
    async findByStudent(studentId) {
        return this.lateRequestModel.find({ studentId: new mongoose_2.Types.ObjectId(studentId) })
            .populate('teacherId', 'name email')
            .populate('assessmentId', 'title')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async findByTeacher(teacherId) {
        return this.lateRequestModel.find({ teacherId: new mongoose_2.Types.ObjectId(teacherId) })
            .populate('studentId', 'name username email')
            .populate('assessmentId', 'title')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async updateStatus(id, teacherId, status, teacherComment, extensionUntil) {
        const request = await this.lateRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        if (request.teacherId.toString() !== teacherId) {
            throw new common_1.ForbiddenException('No autorizado para modificar esta solicitud');
        }
        request.status = status;
        if (teacherComment)
            request.teacherComment = teacherComment;
        if (status === late_request_schema_1.LateRequestStatus.APROBADA && extensionUntil) {
            request.extensionUntil = new Date(extensionUntil);
        }
        else if (status !== late_request_schema_1.LateRequestStatus.APROBADA) {
            request.extensionUntil = undefined;
        }
        const updated = await request.save();
        let statusText = '';
        switch (status) {
            case late_request_schema_1.LateRequestStatus.REVISANDO:
                statusText = 'está siendo revisada';
                break;
            case late_request_schema_1.LateRequestStatus.DEVUELTA:
                statusText = 'ha sido devuelta para correcciones';
                break;
            case late_request_schema_1.LateRequestStatus.APROBADA:
                statusText = 'ha sido APROBADA';
                break;
            case late_request_schema_1.LateRequestStatus.RECHAZADA:
                statusText = 'ha sido RECHAZADA';
                break;
            default: statusText = 'ha cambiado de estado';
        }
        await this.notificationsService.create(request.studentId.toString(), 'Actualización en tu Solicitud', `Tu solicitud de examen atrasado ${statusText}.`, status === late_request_schema_1.LateRequestStatus.APROBADA ? 'SUCCESS' : (status === late_request_schema_1.LateRequestStatus.RECHAZADA ? 'ERROR' : 'INFO'));
        return updated;
    }
    async cancelRequest(id, studentId) {
        const request = await this.lateRequestModel.findById(id).exec();
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        if (request.studentId.toString() !== studentId) {
            throw new common_1.ForbiddenException('No autorizado');
        }
        if (request.status === late_request_schema_1.LateRequestStatus.APROBADA || request.status === late_request_schema_1.LateRequestStatus.RECHAZADA) {
            throw new common_1.BadRequestException('No puedes anular una solicitud que ya fue aprobada o rechazada');
        }
        request.status = late_request_schema_1.LateRequestStatus.ANULADA;
        const updated = await request.save();
        await this.notificationsService.create(request.teacherId.toString(), 'Solicitud Anulada', `Un estudiante ha anulado su solicitud de examen atrasado.`, 'INFO');
        return updated;
    }
};
exports.LateRequestsService = LateRequestsService;
exports.LateRequestsService = LateRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(late_request_schema_1.LateRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService,
        notifications_service_1.NotificationsService,
        assessments_service_1.AssessmentsService])
], LateRequestsService);
//# sourceMappingURL=late-requests.service.js.map