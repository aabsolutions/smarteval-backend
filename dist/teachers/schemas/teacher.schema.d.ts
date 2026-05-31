import { Document } from 'mongoose';
export declare class Teacher extends Document {
    identifier: string;
    name: string;
    email?: string;
    phone?: string;
}
export declare const TeacherSchema: import("mongoose").Schema<Teacher, import("mongoose").Model<Teacher, any, any, any, Document<unknown, any, Teacher, any, {}> & Teacher & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Teacher, Document<unknown, {}, import("mongoose").FlatRecord<Teacher>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Teacher> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
