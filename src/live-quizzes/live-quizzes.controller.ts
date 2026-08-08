import { Controller, Get, Post, Body, Put, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { LiveQuizzesService } from './live-quizzes.service';
import { CreateLiveQuizDto } from './dto/create-live-quiz.dto';
import { UpdateLiveQuizDto } from './dto/update-live-quiz.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('live-quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveQuizzesController {
  constructor(private readonly liveQuizzesService: LiveQuizzesService) {}

  @Post()
  @Roles('TEACHER', 'ADMIN')
  create(@Body() createLiveQuizDto: CreateLiveQuizDto, @Request() req) {
    return this.liveQuizzesService.create(createLiveQuizDto, req.user.userId);
  }

  @Get('teacher')
  @Roles('TEACHER', 'ADMIN')
  findAllByTeacher(@Request() req) {
    return this.liveQuizzesService.findAllByTeacher(req.user.userId);
  }

  @Get(':id')
  @Roles('TEACHER', 'ADMIN')
  findOne(@Param('id') id: string, @Request() req) {
    return this.liveQuizzesService.findOneByTeacher(id, req.user.userId);
  }

  @Put(':id')
  @Roles('TEACHER', 'ADMIN')
  update(@Param('id') id: string, @Body() updateLiveQuizDto: UpdateLiveQuizDto, @Request() req) {
    return this.liveQuizzesService.update(id, updateLiveQuizDto, req.user.userId);
  }

  @Delete(':id')
  @Roles('TEACHER', 'ADMIN')
  remove(@Param('id') id: string, @Request() req) {
    return this.liveQuizzesService.delete(id, req.user.userId);
  }

  @Post(':id/import-questions')
  @Roles('TEACHER', 'ADMIN')
  importQuestions(@Param('id') id: string, @Body() importDto: ImportQuestionsDto, @Request() req) {
    return this.liveQuizzesService.importQuestionsFromBank(id, importDto, req.user.userId);
  }
}
