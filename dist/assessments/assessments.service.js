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
exports.AssessmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const assessment_schema_1 = require("./assessment.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const students_service_1 = require("../students/students.service");
const late_request_schema_1 = require("../late-requests/late-request.schema");
let AssessmentsService = class AssessmentsService {
    constructor(assessmentModel, lateRequestModel, notificationsService, studentsService) {
        this.assessmentModel = assessmentModel;
        this.lateRequestModel = lateRequestModel;
        this.notificationsService = notificationsService;
        this.studentsService = studentsService;
    }
    async create(createDto, teacherId) {
        const created = new this.assessmentModel({
            ...createDto,
            topicId: new mongoose_2.Types.ObjectId(createDto.topicId),
            teacherId: new mongoose_2.Types.ObjectId(teacherId),
            groupIds: createDto.groupIds.map(id => new mongoose_2.Types.ObjectId(id)),
        });
        await created.save();
        if (createDto.groupIds && createDto.groupIds.length > 0) {
            try {
                const studentUsers = await this.studentsService.getUsersForGroups(createDto.groupIds);
                for (const user of studentUsers) {
                    await this.notificationsService.create(user._id.toString(), '¡Nuevo Examen Asignado!', `Se ha habilitado un nuevo examen: ${createDto.title}. ¡Revisa tus pendientes!`, 'INFO');
                }
            }
            catch (err) {
                console.error('Error enviando notificaciones de nuevo examen:', err);
            }
        }
        return created;
    }
    async findAllByTeacher(teacherId) {
        return this.assessmentModel.find({ teacherId: new mongoose_2.Types.ObjectId(teacherId) })
            .populate('topicId', 'name')
            .populate('groupIds', 'name')
            .lean()
            .exec();
    }
    async findAvailableForStudent(studentGroupId) {
        return this.assessmentModel.find({ groupIds: new mongoose_2.Types.ObjectId(studentGroupId) })
            .populate('topicId', 'name')
            .populate('teacherId', 'name')
            .lean()
            .exec();
    }
    async findAvailableForStudentUser(username, userId) {
        const student = await this.studentsService.findByIdentifier(username);
        if (!student || !student.groupId) {
            return [];
        }
        const groupId = student.groupId._id || student.groupId;
        const assessments = await this.assessmentModel.find({ groupIds: new mongoose_2.Types.ObjectId(groupId) })
            .populate('topicId', 'name')
            .populate('teacherId', 'name')
            .lean()
            .exec();
        const lateRequests = await this.lateRequestModel.find({
            studentId: new mongoose_2.Types.ObjectId(userId),
            status: late_request_schema_1.LateRequestStatus.APROBADA
        }).lean().exec();
        console.log(`Found ${lateRequests.length} approved late requests for student ${student._id}`);
        return assessments.map(a => {
            const extension = lateRequests.find(lr => lr.assessmentId.toString() === a._id.toString());
            if (extension) {
                console.log(`Matching extension found for assessment ${a._id}. extensionUntil:`, extension.extensionUntil);
            }
            if (extension && extension.extensionUntil) {
                return { ...a, extensionUntil: extension.extensionUntil };
            }
            return a;
        });
    }
    async findOne(id) {
        const assessment = await this.assessmentModel.findById(id)
            .populate('topicId', 'name')
            .populate('groupIds', 'name')
            .lean()
            .exec();
        if (!assessment)
            throw new common_1.NotFoundException('Assessment not found');
        return assessment;
    }
    async update(id, teacherId, updateDto) {
        const updated = await this.assessmentModel.findOneAndUpdate({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) }, { $set: updateDto }, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Assessment not found or unauthorized');
        if (updated.groupIds && updated.groupIds.length > 0) {
            try {
                const studentUsers = await this.studentsService.getUsersForGroups(updated.groupIds.map(g => g.toString()));
                for (const user of studentUsers) {
                    await this.notificationsService.create(user._id.toString(), 'Examen Actualizado', `El examen "${updated.title}" ha sido modificado (fechas, duración o intentos). ¡Revisa los cambios!`, 'INFO');
                }
            }
            catch (err) {
                console.error('Error enviando notificaciones de actualización de examen:', err);
            }
        }
        return updated;
    }
    async allowLateStudent(assessmentId, studentId) {
        await this.assessmentModel.findByIdAndUpdate(assessmentId, {
            $addToSet: { allowedLateStudents: new mongoose_2.Types.ObjectId(studentId) }
        });
    }
    async removeLateStudent(assessmentId, studentId) {
        await this.assessmentModel.findByIdAndUpdate(assessmentId, {
            $pull: { allowedLateStudents: new mongoose_2.Types.ObjectId(studentId) }
        });
    }
    async delete(id, teacherId) {
        const deleted = await this.assessmentModel.findOneAndDelete({ _id: id, teacherId: new mongoose_2.Types.ObjectId(teacherId) });
        if (!deleted)
            throw new common_1.NotFoundException('Assessment not found or unauthorized');
        return deleted;
    }
};
exports.AssessmentsService = AssessmentsService;
exports.AssessmentsService = AssessmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(assessment_schema_1.Assessment.name)),
    __param(1, (0, mongoose_1.InjectModel)(late_request_schema_1.LateRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        students_service_1.StudentsService])
], AssessmentsService);
//# sourceMappingURL=assessments.service.js.map