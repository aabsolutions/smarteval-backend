import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
export declare class NotificationsService {
    private notificationModel;
    constructor(notificationModel: Model<Notification>);
    create(userId: string, title: string, message: string, type?: string): Promise<Notification>;
    findByUserId(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<any>;
    removeAllForUser(userId: string): Promise<any>;
}
