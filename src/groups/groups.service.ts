import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './schemas/group.schema';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private teachersService: TeachersService,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const createdGroup = new this.groupModel({
      ...createGroupDto,
      createdBy: userId,
    });
    return createdGroup.save();
  }

  async findAll(userId?: string, userRole?: string, username?: string): Promise<Group[]> {
    const query: any = {};
    if (userRole === 'TEACHER' && username) {
      // Find the teacher by their username (identifier)
      const teachers = await this.teachersService.findAll();
      const teacher = teachers.find(t => t.identifier === username);
      if (teacher) {
        query.teacher = teacher._id;
      } else {
        // If teacher document doesn't exist, return empty array
        return [];
      }
    }
    return this.groupModel.find(query)
      .populate('createdBy', 'name email')
      .populate('teacher', 'name email')
      .populate('institution', 'name')
      .exec();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel.findById(id)
      .populate('createdBy', 'name email')
      .populate('teacher', 'name email')
      .populate('institution', 'name')
      .exec();
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

  async assignTeacher(groupId: string, teacherId: string): Promise<Group> {
    const updatedGroup = await this.groupModel
      .findByIdAndUpdate(groupId, { teacher: teacherId }, { new: true })
      .exec();
    if (!updatedGroup) {
      throw new NotFoundException(`Grupo con ID ${groupId} no encontrado`);
    }
    return updatedGroup;
  }
}
