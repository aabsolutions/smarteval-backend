import { LateRequestsService } from './late-requests.service';
import { LateRequestStatus } from './late-request.schema';
export declare class LateRequestsController {
    private readonly lateRequestsService;
    constructor(lateRequestsService: LateRequestsService);
    createRequest(req: any, teacherId: string, assessmentId: string, reason: string, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("./late-request.schema").LateRequestDocument, {}, {}> & import("./late-request.schema").LateRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRequest(req: any, id: string, reason: string, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("./late-request.schema").LateRequestDocument, {}, {}> & import("./late-request.schema").LateRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getStudentRequests(req: any): Promise<(import("mongoose").FlattenMaps<import("./late-request.schema").LateRequestDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTeacherRequests(req: any): Promise<(import("mongoose").FlattenMaps<import("./late-request.schema").LateRequestDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    updateStatus(req: any, id: string, status: LateRequestStatus, teacherComment?: string, extensionUntil?: string): Promise<import("mongoose").Document<unknown, {}, import("./late-request.schema").LateRequestDocument, {}, {}> & import("./late-request.schema").LateRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancelRequest(req: any, id: string): Promise<import("mongoose").Document<unknown, {}, import("./late-request.schema").LateRequestDocument, {}, {}> & import("./late-request.schema").LateRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
