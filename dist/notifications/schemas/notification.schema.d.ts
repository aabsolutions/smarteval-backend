import { Document, Types } from 'mongoose';
export declare class Notification extends Document {
    userId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Notification> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
