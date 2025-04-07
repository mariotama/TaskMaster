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
 * DTO to update a task
 * All fields are optional
 */
export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType, { message: 'Type must be DAILY or MISSION' })
  @IsOptional()
  type?: TaskType;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsNumber()
  @Min(1, { message: 'XP reward must be at least 1' })
  @Max(1000, { message: `XP reward can't exceed 1000` })
  @IsOptional()
  xpReward?: number;

  @IsNumber()
  @Min(0, { message: `Coin reward can't be negative` })
  @Max(500, { message: `Coin reward can't exceed 1000` })
  @IsOptional()
  coinReward?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Due date must be valid' })
  dueDate?: Date;
}
