import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(req: any): Promise<import("./schemas/notification.schema").Notification[]>;
    markAsRead(id: string): Promise<import("./schemas/notification.schema").Notification>;
    markAllAsRead(req: any): Promise<any>;
}
