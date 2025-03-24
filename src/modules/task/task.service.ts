import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { MoreThan, Repository } from 'typeorm';
import { TaskCompletion } from './entities/task-completion.entity';
import { User } from '../user/entities/user.entity';
import { ProgressionService } from 'src/common/progression/progression.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskType } from 'src/shared/enums/task-type.enum';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProgressionResult } from 'src/shared/interfaces/progression-result.interface';

/**
 * Service for user's task handling
 * Handles create, update, list and task completion
 */
@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskCompletion)
    private taskCompletionRepository: Repository<TaskCompletion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private progressionService: ProgressionService,
    private walletService: WalletService,
  ) {}

  /**
   * Create task for a user
   * @param userId user id
   * @param createTaskDto task data
   * @returns created task
   */
  async create(userId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    // Verifies if user exist
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create task
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: { id: userId },
    });

    return this.taskRepository.save(task);
  }

  /**
   * Obtains all task by one user
   * @param userId user id
   * @param filters optional filters (type, complete)
   * @returns task list
   */

  async findAll(
    userId: number,
    filters?: { type?: TaskType; isCompleted?: boolean },
  ): Promise<Task[]> {
    const whereCondition: {
      user: { id: number };
      type?: TaskType;
      isCompleted?: boolean;
    } = {
      user: { id: userId },
    };

    // Apply filter (if exist)
    if (filters?.type) {
      whereCondition.type = filters.type;
    }
    if (filters?.isCompleted) {
      whereCondition.isCompleted = filters.isCompleted;
    }

    return this.taskRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtain specific task by ID
   * @param id task id
   * @param userId user id
   * @returns found task
   */
  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['completions'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * Updates an existing task
   * @param id task id
   * @param userId user id
   * @param updateTaskDto data to update
   * @returns updated task
   */
  async update(
    id: number,
    userId: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    // Verify that the task exists and belongs to user
    const task = await this.findOne(id, userId);

    // Update fields
    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  /**
   * Delete task
   * @param id task id
   * @param userId user id
   * @returns true if deleted
   */
  async remove(id: number, userId: number): Promise<boolean> {
    // Verify that the task exists and belongs to user
    await this.findOne(id, userId);

    const result = await this.taskRepository.delete(id);

    return (result.affected ?? 0) > 0;
  }

  /**
   * Mark task as completed and give rewards
   * @param id task id
   * @param userId user id
   * @returns result of XP progression and coins gained
   */
  async completeTask(id: number, userId: number): Promise<ProgressionResult> {
    // Verify that the task exists and belongs to user
    const task = await this.findOne(id, userId);

    // Validate that the task isn't already completed
    if (task.isCompleted && task.type === TaskType.MISSION) {
      throw new BadRequestException('This task is already completed');
    }

    // If DAILY, verify if it was completed TODAY
    if (task.type === TaskType.DAILY) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedToday = await this.taskCompletionRepository.findOne({
        where: {
          task: { id },
          user: { id: userId },
          completedAt: MoreThan(today),
        },
      });

      if (completedToday) {
        throw new BadRequestException('This task was already completed today');
      }
    }

    // Register completed
    const completion = this.taskCompletionRepository.create({
      task: { id },
      user: { id: userId },
      xpEarned: task.xpReward,
      coinsEarned: task.coinReward,
    });

    await this.taskCompletionRepository.save(completion);

    // Mark as completed (only for missions)
    if (task.type === TaskType.MISSION) {
      task.isCompleted = true;
      await this.taskRepository.save(task);
    }

    // Give XP and coins
    const progressionResult =
      await this.progressionService.addExperienceAndCoins(
        userId,
        task.xpReward,
        task.coinReward,
        `Task completed: ${task.title}`,
      );

    return progressionResult;
  }

  /**
   * TODO
   * Reinicia las tareas diarias para todos los usuarios
   * Este método debería ejecutarse por un cron job diariamente
   */
  // async resetDailyTasks(): Promise<void> {
  // Para tareas diarias, solo marcamos las completiones
  // No modificamos el estado de isCompleted para mantener historial

  // Este método puede ser llamado por un cron job configurado en el módulo
  //console.log('Tareas diarias reiniciadas para todos los usuarios');
  //}

  /**
   * Obtains historic task completion
   * @param userId user id
   * @param page page number
   * @param limit elements per page
   * @returns paged completion historic
   */
  async getCompletionHistory(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{ completions: TaskCompletion[]; total: number }> {
    const [completions, total] =
      await this.taskCompletionRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ['task'],
        order: { completedAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return { completions, total };
  }

  /**
   * Obtain stats of completed tasks
   * @param userId user id
   * @returns task stats
   */
  async getTaskStatistics(userId: number): Promise<{
    totalCompleted: number;
    dailyCompleted: number;
    missionsCompleted: number;
    streakDays: number;
  }> {
    // Total count of completed tasks
    const totalCompleted = await this.taskCompletionRepository.count({
      where: { user: { id: userId } },
    });

    // Total count of completed missions
    const missionsCompleted = await this.taskRepository.count({
      where: {
        user: { id: userId },
        type: TaskType.MISSION,
        isCompleted: true,
      },
    });

    // Total count of DAILY tasks
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyCompletions = await this.taskCompletionRepository
      .createQueryBuilder('completion')
      .innerJoin('completion.task', 'task')
      .where('completion.user_id = :userId', { userId })
      .andWhere('task.type = :type', { type: TaskType.DAILY })
      .andWhere('completion.completedAt > :date', { date: thirtyDaysAgo })
      .getCount();

    // Calculate streak
    // More complex
    const streakDays = 0; // Placeholder

    return {
      totalCompleted,
      dailyCompleted: dailyCompletions,
      missionsCompleted,
      streakDays,
    };
  }
}
