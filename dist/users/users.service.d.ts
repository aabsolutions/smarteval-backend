import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
export declare class UsersService implements OnModuleInit {
    private readonly userModel;
    constructor(userModel: Model<User>);
    onModuleInit(): Promise<void>;
    findByUsername(username: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findAll(allowedRoles: string[]): Promise<User[]>;
    update(id: string, updateData: any): Promise<User | null>;
    delete(id: string): Promise<User | null>;
    create(userData: any): Promise<User>;
    private seedUsers;
}
