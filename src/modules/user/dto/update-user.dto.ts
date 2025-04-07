import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO to update a user
 * All fields are optional
 */
export class UpdateUserDto {
  @IsEmail({}, { message: 'Please use a valid e-mail' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
  })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores and dashes',
  })
  @IsOptional()
  username?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  profileImageUrl?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
