import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssessmentAttemptsService } from './assessment-attempts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('assessment-attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentAttemptsController {
  constructor(private readonly attemptsService: AssessmentAttemptsService) {}

  @Post('start/:assessmentId')
  @Roles('STUDENT')
  startAttempt(@Param('assessmentId') assessmentId: string, @Request() req) {
    return this.attemptsService.startAttempt(assessmentId, req.user.userId || req.user.sub);
  }

  @Post('submit/:attemptId')
  @Roles('STUDENT')
  submitAttempt(
    @Param('attemptId') attemptId: string,
    @Body('answers') answers: { questionId: string, answers: string[] }[],
    @Body('antiCheatLog') antiCheatLog: any,
    @Body('isTimeout') isTimeout: boolean,
    @Request() req
  ) {
    return this.attemptsService.submitAttempt(
      attemptId, 
      req.user.userId || req.user.sub, 
      answers,
      antiCheatLog,
      isTimeout
    );
  }

  @Get('student/history')
  @Roles('STUDENT')
  getStudentHistory(@Request() req) {
    return this.attemptsService.getStudentHistory(req.user.userId || req.user.sub);
  }

  @Get('status/:assessmentId')
  @Roles('STUDENT')
  getAttemptStatus(@Param('assessmentId') assessmentId: string, @Request() req) {
    return this.attemptsService.getAttemptStatus(assessmentId, req.user.userId || req.user.sub);
  }

  @Get('details/:attemptId')
  @Roles('STUDENT')
  getAttemptDetails(@Param('attemptId') attemptId: string, @Request() req) {
    return this.attemptsService.getAttemptDetails(attemptId, req.user.userId || req.user.sub);
  }

  @Patch(':id/archive')
  @Roles('TEACHER', 'ADMIN')
  archiveAttempt(@Param('id') id: string) {
    return this.attemptsService.archiveAttempt(id);
  }

  @Get(':assessmentId/archived')
  @Roles('TEACHER', 'ADMIN')
  getArchivedAttempts(@Param('assessmentId') assessmentId: string) {
    return this.attemptsService.getArchivedAttempts(assessmentId);
  }
}
