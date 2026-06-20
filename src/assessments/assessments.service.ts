import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment, AssessmentDocument } from './assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { StudentsService } from '../students/students.service';
import { LateRequest, LateRequestDocument, LateRequestStatus } from '../late-requests/late-request.schema';
import { Question, QuestionDocument } from '../questions/question.schema';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<AssessmentDocument>,
    @InjectModel(LateRequest.name) private lateRequestModel: Model<LateRequestDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
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

  async findAllByTeacher(teacherId: string): Promise<any[]> {
    return this.assessmentModel.find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('topicId', 'name')
      .populate('groupIds', 'name')
      .lean()
      .exec();
  }

  async findAvailableForStudent(studentGroupId: string): Promise<any[]> {
    return this.assessmentModel.find({ groupIds: new Types.ObjectId(studentGroupId) })
      .populate('topicId', 'name')
      .populate('teacherId', 'name')
      .lean()
      .exec();
  }

  async findAvailableForStudentUser(username: string, userId: string): Promise<any[]> {
    const student = await this.studentsService.findByIdentifier(username);
    if (!student || !student.groupId) {
      return [];
    }
    const groupId = (student.groupId as any)._id || student.groupId;
    
    const assessments = await this.assessmentModel.find({ groupIds: new Types.ObjectId(groupId) })
      .populate('topicId', 'name')
      .populate('teacherId', 'name')
      .lean()
      .exec();

    // Check for approved late requests for this student
    const lateRequests = await this.lateRequestModel.find({
      studentId: new Types.ObjectId(userId),
      status: LateRequestStatus.APROBADA
    }).lean().exec();
    console.log(`Found ${lateRequests.length} approved late requests for student ${student._id}`);

    return assessments.map(a => {
      const extension = lateRequests.find(lr => lr.assessmentId.toString() === a._id.toString());
      if (extension) {
        console.log(`Matching extension found for assessment ${a._id}. extensionUntil:`, extension.extensionUntil);
      }
      if (extension && extension.extensionUntil) {
        return { ...a, extensionUntil: extension.extensionUntil };
      }
      return a;
    });
  }

  async getFlashcards(assessmentId: string, username: string, userId: string): Promise<any> {
    const availableAssessments = await this.findAvailableForStudentUser(username, userId);
    const assessment = availableAssessments.find(a => a._id.toString() === assessmentId);
    
    if (!assessment) {
      throw new NotFoundException('Examen no encontrado o no tienes acceso para estudiarlo.');
    }

    const questions = await this.questionModel.find({ topicId: assessment.topicId._id || assessment.topicId }).lean().exec();

    if (questions.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles en este tema.');
    }

    // Mezclar las preguntas (shuffle)
    const shuffled = questions.sort(() => 0.5 - Math.random());

    return {
      flashcardsTimeLimitMinutes: assessment.flashcardsTimeLimitMinutes || 0,
      questions: shuffled.map(q => ({
        questionId: q._id.toString(),
        type: q.type,
        statement: q.statement,
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        imageUrl: q.imageUrl
      }))
    };
  }

  async findOne(id: string): Promise<any> {
    const assessment = await this.assessmentModel.findById(id)
      .populate('topicId', 'name')
      .populate('groupIds', 'name')
      .lean()
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

  async allowLateStudent(assessmentId: string, studentId: string): Promise<void> {
    await this.assessmentModel.findByIdAndUpdate(assessmentId, {
      $addToSet: { allowedLateStudents: new Types.ObjectId(studentId) }
    });
  }

  async removeLateStudent(assessmentId: string, studentId: string): Promise<void> {
    await this.assessmentModel.findByIdAndUpdate(assessmentId, {
      $pull: { allowedLateStudents: new Types.ObjectId(studentId) }
    });
  }

  async delete(id: string, teacherId: string): Promise<any> {
    const deleted = await this.assessmentModel.findOneAndDelete({ _id: id, teacherId: new Types.ObjectId(teacherId) });
    if (!deleted) throw new NotFoundException('Assessment not found or unauthorized');
    return deleted;
  }
}
