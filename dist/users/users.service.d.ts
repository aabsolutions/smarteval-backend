import { OnModuleInit } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { User } from './schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class UsersService implements OnModuleInit {
    private readonly userModel;
    private readonly connection;
    private readonly notificationsService;
    private readonly cloudinaryService;
    constructor(userModel: Model<User>, connection: Connection, notificationsService: NotificationsService, cloudinaryService: CloudinaryService);
    onModuleInit(): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    getUserInstitutionLogo(user: User): Promise<string | null>;
    findAll(allowedRoles: string[], page?: number, limit?: number, search?: string): Promise<{
        data: User[];
        total: number;
    }>;
    update(id: string, updateData: any, file?: Express.Multer.File): Promise<User | null>;
    delete(id: string): Promise<User | null>;
    resetPassword(id: string): Promise<any>;
    changePassword(userId: string, currentPass: string, newPass: string): Promise<any>;
    create(userData: any): Promise<User>;
    private seedUsers;
}
