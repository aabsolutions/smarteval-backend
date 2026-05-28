import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class Group extends Document {
    name: string;
    description: string;
    createdBy: MongooseSchema.Types.ObjectId;
    teachers: MongooseSchema.Types.ObjectId[];
}
export declare const GroupSchema: MongooseSchema<Group, import("mongoose").Model<Group, any, any, any, Document<unknown, any, Group, any, {}> & Group & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Group, Document<unknown, {}, import("mongoose").FlatRecord<Group>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Group> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
