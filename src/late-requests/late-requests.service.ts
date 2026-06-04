import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LateRequest, LateRequestDocument, LateRequestStatus } from './late-request.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssessmentsService } from '../assessments/assessments.service';

@Injectable()
export class LateRequestsService {
  constructor(
    @InjectModel(LateRequest.name) private lateRequestModel: Model<LateRequestDocument>,
    private cloudinaryService: CloudinaryService,
    private notificationsService: NotificationsService,
    private assessmentsService: AssessmentsService
  ) {}

  async createRequest(
    studentId: string, 
    teacherId: string, 
    assessmentId: string, 
    reason: string, 
    files: Express.Multer.File[]
  ) {
    if (!teacherId || !assessmentId || !reason) {
      throw new BadRequestException('Faltan datos obligatorios');
    }

    // Subir imágenes si existen
    const imageUrls: string[] = [];
    const imagePublicIds: string[] = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult: any = await this.cloudinaryService.uploadImage(file);
        imageUrls.push(uploadResult.secure_url);
        imagePublicIds.push(uploadResult.public_id);
      }
    }

    const newRequest = new this.lateRequestModel({
      studentId: new Types.ObjectId(studentId),
      teacherId: new Types.ObjectId(teacherId),
      assessmentId: new Types.ObjectId(assessmentId),
      reason,
      imageUrls,
      imagePublicIds,
    });

    const saved = await newRequest.save();

    // Notificar al profesor
    const assessment = await this.assessmentsService.findOne(assessmentId);
    await this.notificationsService.create(
      teacherId,
      'Nueva Solicitud de Examen Atrasado',
      `Un estudiante ha solicitado rendir el examen "${assessment.title}". Revisa la bandeja de solicitudes.`,
      'INFO'
    );

    return saved;
  }

  async updateRequest(
    id: string,
    studentId: string,
    reason: string,
    files: Express.Multer.File[]
  ) {
    const request = await this.lateRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.studentId.toString() !== studentId) throw new ForbiddenException('No autorizado');
    
    if (request.status !== LateRequestStatus.DEVUELTA && request.status !== LateRequestStatus.RECIBIDA) {
      throw new BadRequestException('Solo se pueden modificar solicitudes en estado DEVUELTA o RECIBIDA');
    }

    if (reason) request.reason = reason;

    if (files && files.length > 0) {
      const imageUrls: string[] = [];
      const imagePublicIds: string[] = [];
      for (const file of files) {
        const uploadResult: any = await this.cloudinaryService.uploadImage(file);
        imageUrls.push(uploadResult.secure_url);
        imagePublicIds.push(uploadResult.public_id);
      }
      // Reemplazar imágenes anteriores (opcionalmente se podrían borrar de cloudinary)
      if (request.imagePublicIds && request.imagePublicIds.length > 0) {
        for (const pubId of request.imagePublicIds) {
          try { await this.cloudinaryService.deleteImage(pubId); } catch(e) {}
        }
      }
      request.imageUrls = imageUrls;
      request.imagePublicIds = imagePublicIds;
    }

    request.status = LateRequestStatus.RECIBIDA; // Vuelve a recibida tras la modificación
    
    const saved = await request.save();

    await this.notificationsService.create(
      request.teacherId.toString(),
      'Solicitud Modificada',
      `El estudiante ha modificado su solicitud de examen atrasado.`,
      'INFO'
    );

    return saved;
  }

  async findByStudent(studentId: string) {
    return this.lateRequestModel.find({ studentId: new Types.ObjectId(studentId) })
      .populate('teacherId', 'name email')
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findByTeacher(teacherId: string) {
    return this.lateRequestModel.find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('studentId', 'name username email')
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async updateStatus(id: string, teacherId: string, status: LateRequestStatus, teacherComment?: string, extensionUntil?: string) {
    const request = await this.lateRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    
    if (request.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('No autorizado para modificar esta solicitud');
    }

    request.status = status;
    if (teacherComment) request.teacherComment = teacherComment;
    
    if (status === LateRequestStatus.APROBADA && extensionUntil) {
      request.extensionUntil = new Date(extensionUntil);
    } else if (status !== LateRequestStatus.APROBADA) {
      request.extensionUntil = undefined;
    }
    
    const updated = await request.save();

    // Notificar al estudiante
    let statusText = '';
    switch(status) {
      case LateRequestStatus.REVISANDO: statusText = 'está siendo revisada'; break;
      case LateRequestStatus.DEVUELTA: statusText = 'ha sido devuelta para correcciones'; break;
      case LateRequestStatus.APROBADA: statusText = 'ha sido APROBADA'; break;
      case LateRequestStatus.RECHAZADA: statusText = 'ha sido RECHAZADA'; break;
      default: statusText = 'ha cambiado de estado';
    }

    await this.notificationsService.create(
      request.studentId.toString(),
      'Actualización en tu Solicitud',
      `Tu solicitud de examen atrasado ${statusText}.`,
      status === LateRequestStatus.APROBADA ? 'SUCCESS' : (status === LateRequestStatus.RECHAZADA ? 'ERROR' : 'INFO')
    );

    return updated;
  }

  async cancelRequest(id: string, studentId: string) {
    const request = await this.lateRequestModel.findById(id).exec();
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    
    if (request.studentId.toString() !== studentId) {
      throw new ForbiddenException('No autorizado');
    }

    if (request.status === LateRequestStatus.APROBADA || request.status === LateRequestStatus.RECHAZADA) {
      throw new BadRequestException('No puedes anular una solicitud que ya fue aprobada o rechazada');
    }

    request.status = LateRequestStatus.ANULADA;
    const updated = await request.save();

    // Notificar al profesor
    await this.notificationsService.create(
      request.teacherId.toString(),
      'Solicitud Anulada',
      `Un estudiante ha anulado su solicitud de examen atrasado.`,
      'INFO'
    );

    return updated;
  }
}
