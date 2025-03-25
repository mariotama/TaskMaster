import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEquipment } from 'src/modules/shop/entities/user-equipment.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { TaskCompletion } from 'src/modules/task/entities/task-completion.entity';
import { Achievement } from 'src/modules/achievement/entities/achievement.entity';
import { UserService } from 'src/modules/user/user.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { AchievementService } from 'src/modules/achievement/achievement.service';
import { EquipmentType } from 'src/shared/enums/equipment-type.enum';
import { ProgressionResult } from 'src/shared/interfaces/progression-result.interface';

@Injectable()
export class ProgressionService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserEquipment)
    private userEquipmentRepository: Repository<UserEquipment>,
    @InjectRepository(TaskCompletion)
    private taskCompletionRepository: Repository<TaskCompletion>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    private userService: UserService,
    private walletService: WalletService,
    private achievementService: AchievementService,
  ) {}

  /**
   * Add experience and coins to user
   * Applies equipment bonus and handles levelups
   */
  async addExperienceAndCoins(
    userId: number,
    xpAmount: number,
    coinsAmount: number,
    transactionDescription: string,
  ): Promise<ProgressionResult> {
    // Obtain user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Calculate equipment bonuses
    const { xpMultiplier, coinMultiplier } =
      await this.calculateBonuses(userId);

    // Apply bonuses
    const adjustedXp = Math.floor(xpAmount * xpMultiplier);
    const adjustedCoins = Math.floor(coinsAmount * coinMultiplier);

    // Add XP
    user.currentXp += adjustedXp;

    // Verify if level up
    let leveledUp = false;

    // While to handle multiples levelups at once
    while (user.currentXp >= user.xpToNextLevel) {
      user.currentXp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = this.calculateXpForNextLevel(user.level);
      leveledUp = true;
    }

    // Save changes on user
    await this.userRepository.save(user);

    // Add coins via WalletService
    await this.walletService.addCoins(
      userId,
      adjustedCoins,
      transactionDescription,
    );

    // Check and potentially unlock achievements
    const unlockedAchievements = await this.checkProgressAchievements(
      userId,
      adjustedXp,
      adjustedCoins,
      user.level,
      leveledUp,
    );

    // Return result
    return {
      xpGained: adjustedXp,
      coinsGained: adjustedCoins,
      currentXp: user.currentXp,
      xpToNextLevel: user.xpToNextLevel,
      currentLevel: user.level,
      leveledUp,
      unlockedAchievements: unlockedAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
      })),
    };
  }

  /**
   * Check and unlock various achievements based on progression
   */
  private async checkProgressAchievements(
    userId: number,
    xpGained: number,
    coinsGained: number,
    currentLevel: number,
    leveledUp: boolean,
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    // Level achievements
    if (leveledUp) {
      const levelAchievements = await this.checkLevelAchievements(
        userId,
        currentLevel,
      );
      unlockedAchievements.push(...levelAchievements);
    }

    // Task completion achievements
    const completedTasksCount = await this.taskCompletionRepository.count({
      where: { user: { id: userId } },
    });
    const taskAchievements = await this.checkTaskAchievements(
      userId,
      completedTasksCount,
    );
    unlockedAchievements.push(...taskAchievements);

    // Equipment collection achievements
    const userEquipmentCount = await this.userEquipmentRepository.count({
      where: { user: { id: userId } },
    });
    const equipmentAchievements = await this.checkEquipmentAchievements(
      userId,
      userEquipmentCount,
    );
    unlockedAchievements.push(...equipmentAchievements);

    return unlockedAchievements;
  }

  /**
   * Check and unlock level-based achievements
   */
  private async checkLevelAchievements(
    userId: number,
    currentLevel: number,
  ): Promise<Achievement[]> {
    const levelAchievementLevels = [5, 10, 25, 50];
    const unlockedAchievements: Achievement[] = [];

    for (const level of levelAchievementLevels) {
      if (currentLevel >= level) {
        const achievement = await this.achievementRepository.findOne({
          where: {
            user: { id: userId },
            name: `Level ${level} Master`,
            isUnlocked: false,
          },
        });

        if (achievement) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
          await this.achievementRepository.save(achievement);
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check and unlock task completion achievements
   */
  private async checkTaskAchievements(
    userId: number,
    completedTasksCount: number,
  ): Promise<Achievement[]> {
    const taskAchievementThresholds = [10, 50, 100, 500];
    const unlockedAchievements: Achievement[] = [];

    for (const count of taskAchievementThresholds) {
      if (completedTasksCount >= count) {
        const achievement = await this.achievementRepository.findOne({
          where: {
            user: { id: userId },
            name: `Task Champion ${count}`,
            isUnlocked: false,
          },
        });

        if (achievement) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
          await this.achievementRepository.save(achievement);
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check and unlock equipment-related achievements
   */
  private async checkEquipmentAchievements(
    userId: number,
    equipmentCount: number,
  ): Promise<Achievement[]> {
    const equipmentAchievementThresholds = [5, 15];
    const unlockedAchievements: Achievement[] = [];

    for (const count of equipmentAchievementThresholds) {
      if (equipmentCount >= count) {
        const achievement = await this.achievementRepository.findOne({
          where: {
            user: { id: userId },
            name: `Equipment Collector ${count}`,
            isUnlocked: false,
          },
        });

        if (achievement) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date();
          await this.achievementRepository.save(achievement);
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  }

  // Existing methods from the original implementation
  async calculateBonuses(
    userId: number,
  ): Promise<{ xpMultiplier: number; coinMultiplier: number }> {
    // Search active user equipment
    const equippedItem = await this.userEquipmentRepository.find({
      where: {
        user: { id: userId },
        isEquipped: true,
      },
      relations: ['equipment'],
    });

    // Base values (100%)
    let xpMultiplier = 1.0;
    let coinMultiplier = 1.0;

    // Bonuses sum of equipped items
    for (const item of equippedItem) {
      if (item.equipment.stats.xpBonus) {
        xpMultiplier += item.equipment.stats.xpBonus / 100;
      }
      if (item.equipment.stats.coinBonus) {
        coinMultiplier += item.equipment.stats.coinBonus / 100;
      }
    }

    return { xpMultiplier, coinMultiplier };
  }

  calculateXpForNextLevel(currentLevel: number): number {
    // Formula:  100 * actual level
    // This formula can be adjusted for higher levels
    return 100 * currentLevel;
  }

  async getEquippedItems(
    userId: number,
  ): Promise<Map<EquipmentType, UserEquipment>> {
    const equippedItems = await this.userEquipmentRepository.find({
      where: {
        user: { id: userId },
        isEquipped: true,
      },
      relations: ['equipment'],
    });

    // Create type map to equipped item
    const equipMap = new Map<EquipmentType, UserEquipment>();

    for (const item of equippedItems) {
      equipMap.set(item.equipment.type, item);
    }

    return equipMap;
  }

  async getUserStats(userId: number): Promise<{
    level: number;
    currentXp: number;
    xpToNextLevel: number;
    xpBonus: number;
    coinBonus: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { xpMultiplier, coinMultiplier } =
      await this.calculateBonuses(userId);

    return {
      level: user.level,
      currentXp: user.currentXp,
      xpToNextLevel: user.xpToNextLevel,
      xpBonus: Math.round((xpMultiplier - 1) * 100), // Convert to %
      coinBonus: Math.round((coinMultiplier - 1) * 100), // Convert to %
    };
  }
}
