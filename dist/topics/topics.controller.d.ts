import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
export declare class TopicsController {
    private readonly topicsService;
    constructor(topicsService: TopicsService);
    create(createTopicDto: CreateTopicDto, req: any): Promise<import("./topic.schema").Topic>;
    findAll(req: any): Promise<import("./topic.schema").Topic[]>;
    findOne(id: string, req: any): Promise<import("./topic.schema").Topic>;
    update(id: string, updateTopicDto: UpdateTopicDto, req: any): Promise<import("./topic.schema").Topic>;
    remove(id: string, req: any): Promise<import("./topic.schema").Topic>;
}
