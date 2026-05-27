import { IsNotEmpty, IsString, IsArray, IsNumber, IsEnum, IsMongoId } from 'class-validator';
import { QuestionDifficulty, QuestionType } from '../question.schema';

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsNotEmpty()
  @IsString()
  statement: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  correctAnswers: string[];

  @IsNumber()
  points: number;

  @IsEnum(QuestionDifficulty)
  difficulty: QuestionDifficulty;

  @IsMongoId()
  topicId: string;
}
