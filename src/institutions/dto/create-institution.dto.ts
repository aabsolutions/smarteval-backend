import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
