import { Document, Types, Schema as MongooseSchema } from 'mongoose';
export declare enum LiveQuizStatus {
    DRAFT = "draft",
    LOBBY = "lobby",
    IN_PROGRESS = "in-progress",
    BETWEEN_QUESTIONS = "between-questions",
    PODIUM = "podium",
    FINISHED = "finished"
}
export declare class LiveQuizQuestion {
    questionId: string;
    type: string;
    statement: string;
    options: string[];
    correctAnswers: string[];
    matchingOptions?: string[];
    points: number;
    imageUrl?: string;
    timeLimitSeconds: number;
}
export declare class LiveQuizParticipant {
    userId: Types.ObjectId;
    name: string;
    totalScore: number;
    correctAnswers: number;
    totalResponseTimeMs: number;
    currentStreak: number;
}
export declare class LiveQuizAnswer {
    userId: Types.ObjectId;
    questionIndex: number;
    answers: string[];
    responseTimeMs: number;
    isCorrect: boolean;
    pointsAwarded: number;
}
export declare class LiveQuiz extends Document {
    title: string;
    description?: string;
    pin: string;
    teacherId: Types.ObjectId;
    groupIds: Types.ObjectId[];
    status: LiveQuizStatus;
    questions: LiveQuizQuestion[];
    participants: LiveQuizParticipant[];
    answers: LiveQuizAnswer[];
    currentQuestionIndex: number;
    startedAt?: Date;
    finishedAt?: Date;
}
export declare const LiveQuizSchema: MongooseSchema<LiveQuiz, import("mongoose").Model<LiveQuiz, any, any, any, Document<unknown, any, LiveQuiz, any, {}> & LiveQuiz & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LiveQuiz, Document<unknown, {}, import("mongoose").FlatRecord<LiveQuiz>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LiveQuiz> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
