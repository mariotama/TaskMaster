import { Exclude, Expose, Type } from 'class-transformer';

/**
 * DTO para respuestas que incluyen información de usuario
 * Excluye información sensible como contraseñas
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
 * DTO para respuesta de autenticación
 * Incluye token JWT y datos del usuario
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
