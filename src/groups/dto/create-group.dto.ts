import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  institution: string;

  @IsEnum(['MATUTINA', 'VESPERTINA', 'NOCTURNA', 'VIRTUAL'])
  @IsNotEmpty()
  jornada: string;

  @IsEnum(['EGB MEDIA', 'EGB SUPERIOR', 'BACHILLERATO', 'SUPERIOR'])
  @IsNotEmpty()
  nivel: string;

  @IsOptional()
  teacher?: string | null;
}
