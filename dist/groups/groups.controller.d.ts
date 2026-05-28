import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    create(createGroupDto: CreateGroupDto, req: any): Promise<import("./schemas/group.schema").Group>;
    findAll(req: any): Promise<import("./schemas/group.schema").Group[]>;
    findOne(id: string): Promise<import("./schemas/group.schema").Group>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<import("./schemas/group.schema").Group>;
    remove(id: string): Promise<import("./schemas/group.schema").Group>;
}
