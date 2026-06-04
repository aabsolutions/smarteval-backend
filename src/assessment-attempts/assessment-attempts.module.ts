import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentAttemptsController } from './assessment-attempts.controller';
import { AssessmentAttemptsService } from './assessment-attempts.service';
import { AssessmentAttempt, AssessmentAttemptSchema } from './assessment-attempt.schema';
import { Assessment, AssessmentSchema } from '../assessments/assessment.schema';
import { Question, QuestionSchema } from '../questions/question.schema';
import { LateRequest, LateRequestSchema } from '../late-requests/late-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssessmentAttempt.name, schema: AssessmentAttemptSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: LateRequest.name, schema: LateRequestSchema }
    ])
  ],
  controllers: [AssessmentAttemptsController],
  providers: [AssessmentAttemptsService],
  exports: [AssessmentAttemptsService]
})
export class AssessmentAttemptsModule {}
