import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateBulkQuestionsDto } from './dto/create-bulk-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }
    return this.questionsService.uploadImage(file);
  }

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionsService.create(createQuestionDto, req.user.userId);
  }

  @Post('bulk')
  createBulk(@Body() createBulkDto: CreateBulkQuestionsDto, @Request() req) {
    return this.questionsService.createBulk(createBulkDto.questions, req.user.userId);
  }

  @Get()
  findAll(@Query('topicId') topicId: string, @Request() req) {
    return this.questionsService.findAllByTeacher(req.user.userId, topicId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.questionsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto, @Request() req) {
    return this.questionsService.update(id, updateQuestionDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.questionsService.remove(id, req.user.userId);
  }

  @Post('bulk-points')
  updateBulkPoints(@Body() body: { ids: string[], points: number }, @Request() req) {
    return this.questionsService.updateBulkPoints(body.ids, body.points, req.user.userId);
  }

  @Post('bulk-delete')
  removeBulk(@Body() body: { ids: string[] }, @Request() req) {
    return this.questionsService.removeBulk(body.ids, req.user.userId);
  }
}
