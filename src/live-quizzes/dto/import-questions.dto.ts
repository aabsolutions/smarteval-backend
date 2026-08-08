import { IsArray, IsString, IsNumber, Min, Max } from 'class-validator';

export class ImportQuestionsDto {
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];

  @IsNumber()
  @Min(5)
  @Max(120)
  defaultTimeLimitSeconds: number;
}
