import { Document, Types } from 'mongoose';
export type TopicDocument = Topic & Document;
export declare class Topic {
    name: string;
    description: string;
    teacherId: Types.ObjectId;
}
export declare const TopicSchema: import("mongoose").Schema<Topic, import("mongoose").Model<Topic, any, any, any, Document<unknown, any, Topic, any, {}> & Topic & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Topic, Document<unknown, {}, import("mongoose").FlatRecord<Topic>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Topic> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
