import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @ValidateIf((o) => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;
}
