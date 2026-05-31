import { Model } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './schemas/group.schema';
import { TeachersService } from '../teachers/teachers.service';
export declare class GroupsService {
    private groupModel;
    private teachersService;
    constructor(groupModel: Model<Group>, teachersService: TeachersService);
    create(createGroupDto: CreateGroupDto, userId: string): Promise<Group>;
    findAll(userId?: string, userRole?: string, username?: string): Promise<Group[]>;
    findOne(id: string): Promise<Group>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group>;
    remove(id: string): Promise<Group>;
    assignTeacher(groupId: string, teacherId: string): Promise<Group>;
}
