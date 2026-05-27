import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Topic, TopicDocument } from './topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(@InjectModel(Topic.name) private topicModel: Model<TopicDocument>) {}

  async create(createTopicDto: CreateTopicDto, teacherId: string): Promise<Topic> {
    const createdTopic = new this.topicModel({
      ...createTopicDto,
      teacherId: new Types.ObjectId(teacherId),
    });
    return createdTopic.save();
  }

  async findAllByTeacher(teacherId: string): Promise<Topic[]> {
    return this.topicModel.find({ teacherId: new Types.ObjectId(teacherId) }).exec();
  }

  async findOne(id: string, teacherId: string): Promise<Topic> {
    const topic = await this.topicModel.findOne({ _id: id, teacherId: new Types.ObjectId(teacherId) }).exec();
    if (!topic) {
      throw new NotFoundException(`Topic #${id} not found or unauthorized`);
    }
    return topic;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto, teacherId: string): Promise<Topic> {
    const updatedTopic = await this.topicModel
      .findOneAndUpdate(
        { _id: id, teacherId: new Types.ObjectId(teacherId) },
        updateTopicDto,
        { new: true },
      )
      .exec();
    if (!updatedTopic) {
      throw new NotFoundException(`Topic #${id} not found or unauthorized`);
    }
    return updatedTopic;
  }

  async remove(id: string, teacherId: string): Promise<Topic> {
    const deletedTopic = await this.topicModel
      .findOneAndDelete({ _id: id, teacherId: new Types.ObjectId(teacherId) })
      .exec();
    if (!deletedTopic) {
      throw new NotFoundException(`Topic #${id} not found or unauthorized`);
    }
    return deletedTopic;
  }
}
