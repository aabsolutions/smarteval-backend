import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<AssessmentDocument>,
    private notificationsService: NotificationsService,
    private studentsService: StudentsService
  ) {}

  async create(createDto: CreateAssessmentDto, teacherId: string): Promise<Assessment> {
    const created = new this.assessmentModel({
      ...createDto,
      topicId: new Types.ObjectId(createDto.topicId),
      teacherId: new Types.ObjectId(teacherId),
      groupIds: createDto.groupIds.map(id => new Types.ObjectId(id)),
    });
    
    await created.save();

    // Notificar a los estudiantes de los grupos asignados
    if (createDto.groupIds && createDto.groupIds.length > 0) {
      try {
        const studentUsers = await this.studentsService.getUsersForGroups(createDto.groupIds);
        for (const user of studentUsers) {
          await this.notificationsService.create(
            user._id.toString(),
            '¡Nuevo Examen Asignado!',
            `Se ha habilitado un nuevo examen: ${createDto.title}. ¡Revisa tus pendientes!`,
            'INFO'
          );
        }
      } catch (err) {
        console.error('Error enviando notificaciones de nuevo examen:', err);
      }
    }

    return created;
  }

  async findAllByTeacher(teacherId: string): Promise<Assessment[]> {
    return this.assessmentModel.find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('topicId', 'name')
      .populate('groupIds', 'name')
      .exec();
  }

  async findAvailableForStudent(studentGroupId: string): Promise<Assessment[]> {
    return this.assessmentModel.find({ groupIds: new Types.ObjectId(studentGroupId) })
      .populate('topicId', 'name')
      .populate('teacherId', 'name')
      .exec();
  }

  async findAvailableForStudentUser(username: string): Promise<Assessment[]> {
    const student = await this.studentsService.findByIdentifier(username);
    if (!student || !student.groupId) {
      return [];
    }
    const groupId = (student.groupId as any)._id || student.groupId;
    
    return this.assessmentModel.find({ groupIds: new Types.ObjectId(groupId) })
      .populate('topicId', 'name')
      .populate('teacherId', 'name')
      .exec();
  }

  async findOne(id: string): Promise<Assessment> {
    const assessment = await this.assessmentModel.findById(id)
      .populate('topicId', 'name')
      .populate('groupIds', 'name')
      .exec();
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async update(id: string, teacherId: string, updateDto: any): Promise<Assessment> {
    const updated = await this.assessmentModel.findOneAndUpdate(
      { _id: id, teacherId: new Types.ObjectId(teacherId) },
      { $set: updateDto },
      { new: true }
    ).exec();
    
    if (!updated) throw new NotFoundException('Assessment not found or unauthorized');

    // Notificar actualización si el examen tiene grupos
    if (updated.groupIds && updated.groupIds.length > 0) {
      try {
        const studentUsers = await this.studentsService.getUsersForGroups(updated.groupIds.map(g => g.toString()));
        for (const user of studentUsers) {
          await this.notificationsService.create(
            user._id.toString(),
            'Examen Actualizado',
            `El examen "${updated.title}" ha sido modificado (fechas, duración o intentos). ¡Revisa los cambios!`,
            'INFO'
          );
        }
      } catch (err) {
        console.error('Error enviando notificaciones de actualización de examen:', err);
      }
    }

    return updated;
  }

  async delete(id: string, teacherId: string): Promise<any> {
    const deleted = await this.assessmentModel.findOneAndDelete({ _id: id, teacherId: new Types.ObjectId(teacherId) });
    if (!deleted) throw new NotFoundException('Assessment not found or unauthorized');
    return deleted;
  }
}
