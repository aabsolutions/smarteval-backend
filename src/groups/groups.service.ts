import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './schemas/group.schema';

@Injectable()
export class GroupsService {
  constructor(@InjectModel(Group.name) private groupModel: Model<Group>) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const createdGroup = new this.groupModel({
      ...createGroupDto,
      createdBy: userId,
    });
    return createdGroup.save();
  }

  async findAll(): Promise<Group[]> {
    return this.groupModel.find().populate('createdBy', 'name email').exec();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel.findById(id).populate('createdBy', 'name email').exec();
    if (!group) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .exec();
    if (!updatedGroup) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return updatedGroup;
  }

  async remove(id: string): Promise<Group> {
    const deletedGroup = await this.groupModel.findByIdAndDelete(id).exec();
    if (!deletedGroup) {
      throw new NotFoundException(`Grupo con ID ${id} no encontrado`);
    }
    return deletedGroup;
  }
}
