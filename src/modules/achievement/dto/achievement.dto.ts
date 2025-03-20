import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

/**
 * DTO para la creación de logros
 */
export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del logro es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción del logro es obligatoria' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'El ícono del logro es obligatorio' })
  icon: string;
}

/**
 * DTO para actualizar estados de logros
 */
export class UpdateAchievementDto {
  @IsBoolean()
  @IsOptional()
  isUnlocked?: boolean;
}

/**
 * DTO para respuesta con información de logros
 */
export class AchievementResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  icon: string;

  @Expose()
  isUnlocked: boolean;

  @Expose()
  unlockedAt?: Date;

  constructor(partial: Partial<AchievementResponseDto>) {
    Object.assign(this, partial);
  }
}
