import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, ingresa un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'El nombre de usuario debe contener al menos 3 letras',
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
