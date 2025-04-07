import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Use a valid e-mail' })
  @IsNotEmpty({ message: 'E-mail is mandatory' })
  email: string;

  @IsString()
  @MinLength(3, {
    message: 'Username must be 3 characters or longer',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores and dashes',
  })
  @IsNotEmpty({ message: 'Username is mandatory' })
  username: string;

  @IsString()
  @MinLength(6, {
    message: 'Password must be 6 characters or longer',
  })
  @IsNotEmpty({ message: 'Passsword is requried' })
  password: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsOptional()
  level?: number;

  @IsOptional()
  currentXp?: number;
}
