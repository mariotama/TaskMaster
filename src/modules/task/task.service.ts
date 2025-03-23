import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { TaskCompletion } from './entities/task-completion.entity';
import { User } from '../user/entities/user.entity';
import { ProgressionService } from 'src/common/progression/progression.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskType } from 'src/shared/enums/task-type.enum';

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
}
