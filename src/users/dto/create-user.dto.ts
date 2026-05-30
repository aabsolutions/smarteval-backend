import { IsString, IsEmail, IsNotEmpty, IsArray, ValidateNested, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class RoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  priority?: number;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  cedula?: string;

  @ValidateIf(o => o.email !== '')
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roles: RoleDto[];
}
