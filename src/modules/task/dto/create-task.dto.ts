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
 * DTO for creation of new tasks.
 */
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is mandatory' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType, { message: 'Type must be DAILY or MISSION' })
  @IsNotEmpty({ message: 'Task type is mandatory' })
  type: TaskType;

  @IsNumber()
  @Min(1, { message: 'XP reward must be at least 1' })
  @Max(100, { message: `XP reward can't exceed 100` })
  @IsNotEmpty({ message: 'XP reward is mandatory' })
  xpReward: number;

  @IsNumber()
  @Min(0, { message: `Coin reward can't be negative` })
  @Max(50, { message: `Coin reward can't exceed 50` })
  @IsNotEmpty({ message: 'Coin reward is mandatory' })
  coinReward: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be valid' })
  dueDate?: Date;
}
