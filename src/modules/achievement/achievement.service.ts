import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEquipment } from '../shop/entities/user-equipment.entity';
import { TaskCompletion } from '../task/entities/task-completion.entity';
import { User } from '../user/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { Achievement } from './entities/achievement.entity';
import { AchievementResponseDto } from './dto/achievement.dto';

/**
 * Service to handle user achievements
 * Handles verification, unlocking and checking achivements
 */
@Injectable()
export class AchievementService {
  // Definitions of avaiable achievements
  private readonly achievementDefinitions = [
    // Lvl achievements
    {
      type: 'LEVEL',
      level: 5,
      name: 'Beginner',
      description: 'Reach lvl 5',
      icon: 'level-5',
    },
    {
      type: 'LEVEL',
      level: 10,
      name: 'Apprentice',
      description: 'Reach lvl 10',
      icon: 'level-10',
    },
    {
      type: 'LEVEL',
      level: 25,
      name: 'Expert',
      description: 'Reach lvl 25',
      icon: 'level-25',
    },
    {
      type: 'LEVEL',
      level: 50,
      name: 'Master',
      description: 'Reach lvl 50',
      icon: 'level-50',
    },

    // Task completion achievements
    {
      type: 'TASKS',
      count: 10,
      name: 'Productive',
      description: 'Complete 10 tasks',
      icon: 'tasks-10',
    },
    {
      type: 'TASKS',
      count: 50,
      name: 'Worker',
      description: 'Complete 50 tasks',
      icon: 'tasks-50',
    },
    {
      type: 'TASKS',
      count: 100,
      name: 'Unstoppable',
      description: 'Complete 100 tasks',
      icon: 'tasks-100',
    },
    {
      type: 'TASKS',
      count: 500,
      name: 'Legend',
      description: 'Complete 500 tasks',
      icon: 'tasks-500',
    },

    // Equipment achievements
    {
      type: 'EQUIPMENT',
      count: 5,
      name: 'Collector',
      description: 'Buy 5 pieces of equipment',
      icon: 'equipment-5',
    },
    {
      type: 'EQUIPMENT',
      count: 15,
      name: 'Armory',
      description: 'Adquiere pieces of equipment',
      icon: 'equipment-15',
    },
  ];

  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TaskCompletion)
    private taskCompletionRepository: Repository<TaskCompletion>,
    @InjectRepository(UserEquipment)
    private userEquipmentRepository: Repository<UserEquipment>,
    private walletService: WalletService,
  ) {}

  /**
   * Obtains all of one user achivements
   * @param userId user id
   * @returns list of user achievements
   */
  async findAll(userId: number): Promise<AchievementResponseDto[]> {
    const achievements = await this.achievementRepository.find({
      where: { user: { id: userId } },
      order: { isUnlocked: 'DESC', name: 'ASC' },
    });

    return achievements.map(
      (achievement) =>
        new AchievementResponseDto({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          isUnlocked: achievement.isUnlocked,
          unlockedAt: achievement.unlockedAt,
        }),
    );
  }

  /**
   * Obtains specific achievement
   * @param id achievement id
   * @param userId user id
   * @returns achievement
   */
  async findOne(id: number, userId: number): Promise<AchievementResponseDto> {
    const achievement = await this.achievementRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!achievement) {
      throw new NotFoundException('Logro no encontrado');
    }

    return new AchievementResponseDto({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      isUnlocked: achievement.isUnlocked,
      unlockedAt: achievement.unlockedAt,
    });
  }

  /**
   * Initialize achievements for new user
   * @param userId user id
   * @returns initializeed achievements
   */
  async initializeAchievements(userId: number): Promise<Achievement[]> {
    // Verify if user exist
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Create achievements for user based on definitions
    const achievements = this.achievementDefinitions.map((def) =>
      this.achievementRepository.create({
        name: def.name,
        description: def.description,
        icon: def.icon,
        isUnlocked: false,
        user: { id: userId },
      }),
    );

    return this.achievementRepository.save(achievements);
  }

  /**
   * Verify achievements related to lvl
   * @param userId user id
   * @param level actual user level
   * @returns achievements unlocked (if)
   */
  async checkLevelAchievements(
    userId: number,
    level: number,
  ): Promise<Achievement[]> {
    // Obtain level achievements not unlocked yet
    const levelAchievements = this.achievementDefinitions.filter(
      (def) =>
        def.type === 'LEVEL' && def.level !== undefined && def.level <= level,
    );

    const unlocked: Achievement[] = [];

    for (const def of levelAchievements) {
      // Search for achievement on DB
      const achievement = await this.achievementRepository.findOne({
        where: {
          user: { id: userId },
          name: def.name,
          isUnlocked: false,
        },
      });

      // If exist and is locked, unlock it
      if (achievement) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        await this.achievementRepository.save(achievement);
        unlocked.push(achievement);

        // Give reward for achievement (coins)
        await this.walletService.addCoins(
          userId,
          50, // Base reward for achievement
          `Achievement unlocked: ${achievement.name}`,
        );
      }
    }
    return unlocked;
  }

  async checkTaskAchievements(userId: number): Promise<Achievement[]> {
    // Count completed tasks
    const completedTasksCount = await this.taskCompletionRepository.count({
      where: { user: { id: userId } },
    });

    // Obtain uncompleted tasks achievements
    const taskAchievements = this.achievementDefinitions.filter(
      (def) =>
        def.type === 'TASKS' &&
        def.count !== undefined &&
        def.count <= completedTasksCount,
    );

    const unlocked: Achievement[] = [];

    for (const def of taskAchievements) {
      // Search for the task on DB
      const achievement = await this.achievementRepository.findOne({
        where: {
          user: { id: userId },
          name: def.name,
          isUnlocked: false,
        },
      });

      // If exists and is locked, unlock it
      if (achievement) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        await this.achievementRepository.save(achievement);
        unlocked.push(achievement);

        // Give reward (coins)
        await this.walletService.addCoins(
          userId,
          50, // Base reward
          `Logro desbloqueado: ${achievement.name}`,
        );
      }
    }

    return unlocked;
  }

  /**
   * Verify achievements related with equipment
   * @param userId user id
   * @returns Unlocked achievements (if)
   */
  async checkEquipmentAchievements(userId: number): Promise<Achievement[]> {
    // Count adquired equipment
    const equipmentCount = await this.userEquipmentRepository.count({
      where: { user: { id: userId } },
    });

    // Obtain locked equiped achievements
    const equipmentAchievements = this.achievementDefinitions.filter(
      (def) =>
        def.type === 'EQUIPMENT' &&
        def.count !== undefined &&
        def.count <= equipmentCount,
    );

    const unlocked: Achievement[] = [];

    for (const def of equipmentAchievements) {
      // Search achievement on DB
      const achievement = await this.achievementRepository.findOne({
        where: {
          user: { id: userId },
          name: def.name,
          isUnlocked: false,
        },
      });

      // If exists and is locked, unlock it
      if (achievement) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        await this.achievementRepository.save(achievement);
        unlocked.push(achievement);

        // Give reward (coins)
        await this.walletService.addCoins(
          userId,
          50, // Base reward
          `Logro desbloqueado: ${achievement.name}`,
        );
      }
    }

    return unlocked;
  }

  /**
   * Check all types of achievement of a user
   * Useful after important operations or login
   * @param userId user id
   * @returns All unlocked achievements
   */
  async checkAllAchievements(userId: number): Promise<Achievement[]> {
    // Obtain user data
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['level'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verify all types of achievements
    const levelAchievements = await this.checkLevelAchievements(
      userId,
      user.level,
    );
    const taskAchievements = await this.checkTaskAchievements(userId);
    const equipmentAchievements = await this.checkEquipmentAchievements(userId);

    // Combine all unlocked achievements
    return [
      ...levelAchievements,
      ...taskAchievements,
      ...equipmentAchievements,
    ];
  }

  /**
   * Obtain user's achievment stats
   * @param userId user id
   * @returns achievement stats
   */
  async getAchievementStats(userId: number): Promise<{
    total: number;
    unlocked: number;
    percentage: number;
  }> {
    const achievements = await this.achievementRepository.find({
      where: { user: { id: userId } },
    });

    const total = achievements.length;
    const unlocked = achievements.filter((a) => a.isUnlocked).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return {
      total,
      unlocked,
      percentage,
    };
  }
}
