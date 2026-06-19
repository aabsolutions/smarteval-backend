import { Controller, Post, Get, Patch, Param, Body, UseInterceptors, UploadedFiles, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { LateRequestsService } from './late-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LateRequestStatus } from './late-request.schema';

@Controller('late-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LateRequestsController {
  constructor(private readonly lateRequestsService: LateRequestsService) {}

  @Post()
  @Roles('STUDENT')
  @UseInterceptors(FilesInterceptor('files', 5))
  async createRequest(
    @Request() req,
    @Body('teacherId') teacherId: string,
    @Body('assessmentId') assessmentId: string,
    @Body('reason') reason: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      return await this.lateRequestsService.createRequest(req.user.userId || req.user.sub, teacherId, assessmentId, reason, files);
    } catch (e) {
      throw new BadRequestException(e.message || 'Unknown error during createRequest');
    }
  }

  @Patch(':id/update')
  @Roles('STUDENT')
  @UseInterceptors(FilesInterceptor('files', 5))
  async updateRequest(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.lateRequestsService.updateRequest(id, req.user.userId || req.user.sub, reason, files);
  }

  @Get('student')
  @Roles('STUDENT')
  async getStudentRequests(@Request() req) {
    return this.lateRequestsService.findByStudent(req.user.userId || req.user.sub);
  }

  @Get('teacher')
  @Roles('TEACHER')
  async getTeacherRequests(@Request() req) {
    return this.lateRequestsService.findByTeacher(req.user.userId || req.user.sub);
  }

  @Patch(':id/status')
  @Roles('TEACHER')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: LateRequestStatus,
    @Body('teacherComment') teacherComment?: string,
    @Body('extensionUntil') extensionUntil?: string
  ) {
    return this.lateRequestsService.updateStatus(id, req.user.userId || req.user.sub, status, teacherComment, extensionUntil);
  }

  @Patch(':id/cancel')
  @Roles('STUDENT')
  async cancelRequest(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.lateRequestsService.cancelRequest(id, req.user.userId || req.user.sub);
  }
}

