import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Por favor, ingresa un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe contener al menos 3 carácteres',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'El nombre de usuario solo puede contener letras, números, guiones bajos y guiones.',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'La contraseña debe contener al menos 6 carácteres ',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
