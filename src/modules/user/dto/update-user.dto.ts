import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO para actualizar información de usuario
 * Todos los campos son opcionales en una actualización
 */
export class UpdateUserDto {
  @IsEmail({}, { message: 'Por favor ingresa un email válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, guiones bajos y guiones',
  })
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
