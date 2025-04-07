import { Exclude, Expose, Type } from 'class-transformer';

/**
 * DTO for answers that include user information
 * Exclude sensitive data like password
 */
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  username: string;

  @Expose()
  profileImageUrl?: string;

  @Expose()
  level: number;

  @Expose()
  currentXp: number;

  @Expose()
  xpToNextLevel: number;

  @Expose()
  createdAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO for authentication response
 * Includes JWT token and user information
 */
export class AuthResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @Expose()
  token: string;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
