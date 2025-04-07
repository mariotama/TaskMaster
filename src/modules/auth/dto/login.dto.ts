import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please use a valid e-mail' })
  @IsNotEmpty({ message: 'E-mail is mandatory' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'The username must contain at least 3 characters',
  })
  @IsNotEmpty({ message: 'Username is mandatory' })
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must contain at least 6 characters',
  })
  @IsNotEmpty({ message: 'Password is mandatory' })
  password: string;
}
