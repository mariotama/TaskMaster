import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskType } from '../../../shared/enums/task-type.enum';

/**
 * DTO para la creación de nuevas tareas
 */
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType, { message: 'El tipo debe ser DAILY o MISSION' })
  @IsNotEmpty({ message: 'El tipo de tarea es obligatorio' })
  type: TaskType;

  @IsNumber()
  @Min(1, { message: 'La recompensa de XP debe ser al menos 1' })
  @Max(1000, { message: 'La recompensa de XP no puede exceder 1000' })
  @IsNotEmpty({ message: 'La recompensa de XP es obligatoria' })
  xpReward: number;

  @IsNumber()
  @Min(0, { message: 'La recompensa de monedas no puede ser negativa' })
  @Max(500, { message: 'La recompensa de monedas no puede exceder 500' })
  @IsNotEmpty({ message: 'La recompensa de monedas es obligatoria' })
  coinReward: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha de vencimiento debe ser válida' })
  dueDate?: Date;
}
