import { Document, Schema as MongooseSchema } from 'mongoose';
export type LateRequestDocument = LateRequest & Document;
export declare enum LateRequestStatus {
    RECIBIDA = "RECIBIDA",
    REVISANDO = "REVISANDO",
    DEVUELTA = "DEVUELTA",
    APROBADA = "APROBADA",
    RECHAZADA = "RECHAZADA",
    ANULADA = "ANULADA"
}
export declare class LateRequest {
    studentId: MongooseSchema.Types.ObjectId;
    teacherId: MongooseSchema.Types.ObjectId;
    assessmentId: MongooseSchema.Types.ObjectId;
    reason: string;
    imageUrls: string[];
    imagePublicIds: string[];
    status: string;
    teacherComment?: string;
    extensionUntil?: Date;
}
export declare const LateRequestSchema: MongooseSchema<LateRequest, import("mongoose").Model<LateRequest, any, any, any, Document<unknown, any, LateRequest, any, {}> & LateRequest & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LateRequest, Document<unknown, {}, import("mongoose").FlatRecord<LateRequest>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LateRequest> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
