import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDate,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType } from '../../../shared/enums/task-type.enum';

/**
 * DTO para actualizar tareas existentes
 * Todos los campos son opcionales en una actualización
 */
export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType, { message: 'El tipo debe ser DAILY o MISSION' })
  @IsOptional()
  type?: TaskType;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsNumber()
  @Min(1, { message: 'La recompensa de XP debe ser al menos 1' })
  @Max(1000, { message: 'La recompensa de XP no puede exceder 1000' })
  @IsOptional()
  xpReward?: number;

  @IsNumber()
  @Min(0, { message: 'La recompensa de monedas no puede ser negativa' })
  @Max(500, { message: 'La recompensa de monedas no puede exceder 500' })
  @IsOptional()
  coinReward?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de vencimiento debe ser válida' })
  dueDate?: Date;
}
