import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  reportIdentification?: string;

  logoUrl?: string;
  coverUrl?: string;
}
