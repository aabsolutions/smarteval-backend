import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El usuario es requerido' })
  username: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsBoolean({ message: 'rememberMe debe ser un booleano' })
  @IsOptional()
  rememberMe?: boolean;
}
