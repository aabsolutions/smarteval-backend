import { Model, Types } from 'mongoose';
import { LateRequest, LateRequestDocument, LateRequestStatus } from './late-request.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssessmentsService } from '../assessments/assessments.service';
export declare class LateRequestsService {
    private lateRequestModel;
    private cloudinaryService;
    private notificationsService;
    private assessmentsService;
    constructor(lateRequestModel: Model<LateRequestDocument>, cloudinaryService: CloudinaryService, notificationsService: NotificationsService, assessmentsService: AssessmentsService);
    createRequest(studentId: string, teacherId: string, assessmentId: string, reason: string, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, LateRequestDocument, {}, {}> & LateRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRequest(id: string, studentId: string, reason: string, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, LateRequestDocument, {}, {}> & LateRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByStudent(studentId: string): Promise<(import("mongoose").FlattenMaps<LateRequestDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByTeacher(teacherId: string): Promise<(import("mongoose").FlattenMaps<LateRequestDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(id: string, teacherId: string, status: LateRequestStatus, teacherComment?: string, extensionUntil?: string): Promise<import("mongoose").Document<unknown, {}, LateRequestDocument, {}, {}> & LateRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancelRequest(id: string, studentId: string): Promise<import("mongoose").Document<unknown, {}, LateRequestDocument, {}, {}> & LateRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
