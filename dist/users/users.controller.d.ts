import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any, page?: string, limit?: string): Promise<{
        data: import("./schemas/user.schema").User[];
        total: number;
    }>;
    findOne(id: string, req: any): Promise<import("./schemas/user.schema").User>;
    create(createUserDto: CreateUserDto, req: any): Promise<import("./schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("./schemas/user.schema").User>;
    remove(id: string, req: any): Promise<import("./schemas/user.schema").User>;
    resetPassword(id: string, req: any): Promise<any>;
    updateProfile(updateData: any, req: any): Promise<import("./schemas/user.schema").User>;
    changePassword(passData: any, req: any): Promise<any>;
    private checkPermissions;
}
