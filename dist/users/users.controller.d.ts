import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<import("./schemas/user.schema").User[]>;
    findOne(id: string, req: any): Promise<import("./schemas/user.schema").User>;
    create(createUserDto: CreateUserDto, req: any): Promise<import("./schemas/user.schema").User>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<import("./schemas/user.schema").User>;
    remove(id: string, req: any): Promise<import("./schemas/user.schema").User>;
    private checkPermissions;
}
