import { Controller, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Response } from 'express';

@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/results')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  getResults(@Param('id') id: string, @Request() req) {
    return this.reportsService.getResults(id, req.user.userId);
  }

  @Get(':id/results/:attemptId')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  getAttemptDetail(@Param('id') id: string, @Param('attemptId') attemptId: string, @Request() req): Promise<any> {
    return this.reportsService.getAttemptDetail(id, attemptId, req.user.userId);
  }

  @Get(':id/analytics')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  getQuestionAnalytics(@Param('id') id: string, @Request() req) {
    return this.reportsService.getQuestionAnalytics(id, req.user.userId);
  }

  @Get(':id/export/excel')
  @Roles('TEACHER', 'ADMIN', 'SUPERADMIN')
  async exportExcel(@Param('id') id: string, @Request() req, @Res() res: Response) {
    await this.reportsService.exportExcel(id, req.user.userId, res);
  }
}
