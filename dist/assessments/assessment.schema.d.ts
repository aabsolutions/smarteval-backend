import { Document, Types } from 'mongoose';
export type AssessmentDocument = Assessment & Document;
export declare class Assessment {
    title: string;
    description: string;
    topicId: Types.ObjectId;
    teacherId: Types.ObjectId;
    groupIds: Types.ObjectId[];
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    totalQuestionsToPull: number;
    isActive: boolean;
    antiCheat: boolean;
    shuffleOptions: boolean;
    maxAttempts: number;
    isSimulator: boolean;
}
export declare const AssessmentSchema: import("mongoose").Schema<Assessment, import("mongoose").Model<Assessment, any, any, any, Document<unknown, any, Assessment, any, {}> & Assessment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Assessment, Document<unknown, {}, import("mongoose").FlatRecord<Assessment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Assessment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
