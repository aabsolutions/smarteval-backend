import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  create(@Body() createDto: CreateAssessmentDto, @Request() req) {
    return this.assessmentsService.create(createDto, req.user.userId);
  }

  @Get('teacher')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  findAllByTeacher(@Request() req) {
    return this.assessmentsService.findAllByTeacher(req.user.userId);
  }

  @Get('student')
  @Roles('STUDENT')
  findAvailableForStudent(@Request() req) {
    return this.assessmentsService.findAvailableForStudentUser(req.user.username);
  }

  @Get(':id')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN', 'STUDENT')
  findOne(@Param('id') id: string) {
    return this.assessmentsService.findOne(id);
  }

  @Put(':id')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  update(@Param('id') id: string, @Body() updateDto: UpdateAssessmentDto, @Request() req) {
    return this.assessmentsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.assessmentsService.delete(id, req.user.userId);
  }
}
