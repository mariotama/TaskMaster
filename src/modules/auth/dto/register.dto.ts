import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please, use a valid e-mail' })
  @IsNotEmpty({ message: 'E-mail is mandatory' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores and dashes',
  })
  @IsNotEmpty({ message: 'Username is mandatory' })
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long',
  })
  @IsNotEmpty({ message: 'Password is mandatory' })
  password: string;
}
