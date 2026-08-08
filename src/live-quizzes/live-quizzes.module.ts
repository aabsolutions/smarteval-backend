import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LiveQuiz, LiveQuizSchema } from './schemas/live-quiz.schema';
import { Question, QuestionSchema } from '../questions/question.schema';
import { LiveQuizzesController } from './live-quizzes.controller';
import { LiveQuizzesService } from './live-quizzes.service';
import { LiveQuizGateway } from './live-quiz.gateway';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveQuiz.name, schema: LiveQuizSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
    AuthModule,
    QuestionsModule,
    UsersModule,
  ],
  controllers: [LiveQuizzesController],
  providers: [LiveQuizzesService, LiveQuizGateway],
  exports: [LiveQuizzesService],
})
export class LiveQuizzesModule {}
