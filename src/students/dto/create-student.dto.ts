import { IsString, IsNotEmpty, IsEmail, IsOptional, IsMongoId, ValidateIf } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ValidateIf(o => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsMongoId()
  @IsNotEmpty()
  groupId: string;
}
