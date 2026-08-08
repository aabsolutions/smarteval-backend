import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLiveQuizQuestionDto {
  @IsOptional()
  @IsString()
  questionId?: string;

  @IsEnum(['single-choice', 'multiple-choice', 'true-false', 'fill-blank', 'matching'])
  type: string;

  @IsString()
  @IsNotEmpty()
  statement: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];

  @IsOptional()
  @IsArray()
  matchingOptions?: string[];

  @IsNumber()
  @Min(1)
  points: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsNumber()
  @Min(5)
  @Max(120)
  timeLimitSeconds: number;
}

export class CreateLiveQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLiveQuizQuestionDto)
  questions: CreateLiveQuizQuestionDto[];
}
