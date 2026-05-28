import { Model } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './schemas/group.schema';
export declare class GroupsService {
    private groupModel;
    constructor(groupModel: Model<Group>);
    create(createGroupDto: CreateGroupDto, userId: string): Promise<Group>;
    findAll(userId?: string, userRole?: string): Promise<Group[]>;
    findOne(id: string): Promise<Group>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group>;
    remove(id: string): Promise<Group>;
}
