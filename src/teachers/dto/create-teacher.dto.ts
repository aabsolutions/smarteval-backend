import { IsString, IsNotEmpty, IsOptional, IsEmail, ValidateIf } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @ValidateIf(o => o.email !== '' && o.email !== null)
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
