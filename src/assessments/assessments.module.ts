import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { Assessment, AssessmentSchema } from './assessment.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AssessmentAttempt, AssessmentAttemptSchema } from '../assessment-attempts/assessment-attempt.schema';
import { LateRequest, LateRequestSchema } from '../late-requests/late-request.schema';
import { Question, QuestionSchema } from '../questions/question.schema';

import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentAttempt.name, schema: AssessmentAttemptSchema },
      { name: LateRequest.name, schema: LateRequestSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
    StudentsModule,
    NotificationsModule
  ],
  controllers: [AssessmentsController, ReportsController],
  providers: [AssessmentsService, ReportsService],
  exports: [AssessmentsService]
})
export class AssessmentsModule {}
