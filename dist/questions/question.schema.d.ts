import { Document, Types } from 'mongoose';
export type QuestionDocument = Question & Document;
export declare enum QuestionDifficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export declare enum QuestionType {
    SINGLE_CHOICE = "single-choice",
    MULTIPLE_CHOICE = "multiple-choice",
    TRUE_FALSE = "true-false",
    FILL_BLANK = "fill-blank",
    MATCHING = "matching"
}
export declare class Question {
    type: QuestionType;
    statement: string;
    options: string[];
    correctAnswers: string[];
    points: number;
    difficulty: QuestionDifficulty;
    topicId: Types.ObjectId;
    teacherId: Types.ObjectId;
}
export declare const QuestionSchema: import("mongoose").Schema<Question, import("mongoose").Model<Question, any, any, any, Document<unknown, any, Question, any, {}> & Question & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Question, Document<unknown, {}, import("mongoose").FlatRecord<Question>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Question> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
