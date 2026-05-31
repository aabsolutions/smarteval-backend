import { Document } from 'mongoose';
export declare class Institution extends Document {
    name: string;
}
export declare const InstitutionSchema: import("mongoose").Schema<Institution, import("mongoose").Model<Institution, any, any, any, Document<unknown, any, Institution, any, {}> & Institution & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Institution, Document<unknown, {}, import("mongoose").FlatRecord<Institution>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Institution> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
