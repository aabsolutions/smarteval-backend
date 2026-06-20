import { IsString, IsNotEmpty, IsArray, IsNumber, IsBoolean, IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsMongoId()
  topicId: string;

  @IsArray()
  @IsMongoId({ each: true })
  groupIds: string[];

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNumber()
  durationMinutes: number;

  @IsNumber()
  totalQuestionsToPull: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  antiCheat?: boolean;

  @IsBoolean()
  shuffleOptions: boolean;

  @IsNumber()
  maxAttempts: number;

  @IsBoolean()
  @IsOptional()
  isSimulator?: boolean;

  @IsNumber()
  @IsOptional()
  flashcardsTimeLimitMinutes?: number;
}
