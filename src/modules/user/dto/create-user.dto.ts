import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Por favor, ingresa un email válido ' })
  @IsNotEmpty({ message: 'El email es obligatorio ' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe tener al menos 3 carácteres ',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, guiones bajos y guiones',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsOptional()
  level?: number;

  @IsOptional()
  currentXp?: number;
}
