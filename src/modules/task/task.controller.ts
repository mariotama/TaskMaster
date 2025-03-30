import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../user/entities/user.entity';
import { TaskType } from 'src/shared/enums/task-type.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProgressionResult } from 'src/shared/interfaces/progression-result.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller for tasks
 * Handles creation, updating, listing and completing
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  /**
   * Create new task
   * @param user actual user
   * @param createTaskDto task data
   * @returns created task
   */
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(user.id, createTaskDto);
  }

  /**
   * Obtain all tasks from user with optional filters
   * @param user actual user
   * @param type filter type (optional)
   * @param isCompleted filter if is completed (optional)
   * @returns task list
   */
  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('type', new ParseEnumPipe(TaskType, { optional: true }))
    type?: TaskType,
    @Query('isCompleted', new ParseBoolPipe({ optional: true }))
    isCompleted?: boolean,
  ) {
    return this.taskService.findAll(user.id, { type, isCompleted });
  }

  /**
   * Obtains specific task
   * @param user actual user
   * @param id task id
   * @returns found task
   */
  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.findOne(id, user.id);
  }

  /**
   * Updates existing task
   * @param user actual user
   * @param id task id
   * @param updateTaskDto data to update
   * @returns updated task
   */
  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, user.id, updateTaskDto);
  }

  /**
   * Deletes a task
   * @param user actual user
   * @param id task id
   * @returns confirm message
   */
  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const success = await this.taskService.remove(id, user.id);
    return {
      success,
      message: success
        ? 'Tarea eliminada correctamente'
        : 'No se pudo eliminar la tarea',
    };
  }

  /**
   * Mark task as completed and recieve rewards
   * @param user actual user
   * @param id task id
   * @returns progression result (coins and xp gained)
   */
  @Post(':id/complete')
  async completeTask(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProgressionResult> {
    return this.taskService.completeTask(id, user.id);
  }

  /**
   * Obtains historic of completed tasks
   * @param user actual user
   * @param page numpage
   * @param limit elements per page
   * @returns complete paged historic
   */
  @Get('history/completions')
  async getCompletionHistory(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.taskService.getCompletionHistory(user.id, page, limit);
  }

  /**
   * Obtains completed tasks stats
   * @param user actual user
   * @returns tasks stats
   */
  @Get('stats/summary')
  async getTaskStatistics(@CurrentUser() user: User) {
    return this.taskService.getTaskStatistics(user.id);
  }

  /**
   * Resets daily tasks
   * @param user actual user
   * @returns daily tasks
   */
  @Post('reset-daily')
  @UseGuards(JwtAuthGuard)
  async resetDailyTasks() {
    return this.taskService.forceResetDailyTasks();
  }
}
