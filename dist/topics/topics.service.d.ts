import { Model } from 'mongoose';
import { Topic, TopicDocument } from './topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
export declare class TopicsService {
    private topicModel;
    constructor(topicModel: Model<TopicDocument>);
    create(createTopicDto: CreateTopicDto, teacherId: string): Promise<Topic>;
    findAllByTeacher(teacherId: string): Promise<Topic[]>;
    findOne(id: string, teacherId: string): Promise<Topic>;
    update(id: string, updateTopicDto: UpdateTopicDto, teacherId: string): Promise<Topic>;
    remove(id: string, teacherId: string): Promise<Topic>;
}
