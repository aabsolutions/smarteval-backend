import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class Student extends Document {
    name: string;
    identifier: string;
    email: string;
    groupId: MongooseSchema.Types.ObjectId;
}
export declare const StudentSchema: MongooseSchema<Student, import("mongoose").Model<Student, any, any, any, Document<unknown, any, Student, any, {}> & Student & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Student, Document<unknown, {}, import("mongoose").FlatRecord<Student>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Student> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
