import { Document, Types } from 'mongoose';
export type AssessmentAttemptDocument = AssessmentAttempt & Document;
export declare enum AttemptStatus {
    IN_PROGRESS = "in-progress",
    COMPLETED = "completed"
}
declare class SnapshotQuestion {
    questionId: string;
    type: string;
    statement: string;
    options: string[];
    correctAnswers: string[];
    matchingOptions?: string[];
    points: number;
}
declare class StudentAnswer {
    questionId: string;
    answers: string[];
}
export declare class AssessmentAttempt {
    assessmentId: Types.ObjectId;
    studentId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: AttemptStatus;
    questionsPulled: SnapshotQuestion[];
    studentAnswers: StudentAnswer[];
    score: number;
    maxScore: number;
    antiCheatLog: {
        tabSwitches?: number;
        fullscreenExits?: number;
        copyPasteAttempts?: number;
        devtoolsAttempts?: number;
    };
    isTimeout: boolean;
    outOfTime: boolean;
    isArchived: boolean;
}
export declare const AssessmentAttemptSchema: import("mongoose").Schema<AssessmentAttempt, import("mongoose").Model<AssessmentAttempt, any, any, any, Document<unknown, any, AssessmentAttempt, any, {}> & AssessmentAttempt & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AssessmentAttempt, Document<unknown, {}, import("mongoose").FlatRecord<AssessmentAttempt>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AssessmentAttempt> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
