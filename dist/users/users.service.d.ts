import { OnModuleInit } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { User } from './schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class UsersService implements OnModuleInit {
    private readonly userModel;
    private readonly connection;
    private readonly notificationsService;
    constructor(userModel: Model<User>, connection: Connection, notificationsService: NotificationsService);
    onModuleInit(): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(allowedRoles: string[], page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    update(id: string, updateData: any): Promise<User | null>;
    delete(id: string): Promise<User | null>;
    resetPassword(id: string): Promise<any>;
    changePassword(userId: string, currentPass: string, newPass: string): Promise<any>;
    create(userData: any): Promise<User>;
    private seedUsers;
}
