import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEquipment } from 'src/modules/shop/entities/user-equipment.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { EquipmentType } from 'src/shared/enums/equipment-type.enum';
import { ProgressionResult } from 'src/shared/interfaces/progression-result.interface';
import { Repository } from 'typeorm';

/**
 * Service to handle user progression
 * Handles XP, lvls and equipment bonuses
 */
@Injectable()
export class ProgressionService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserEquipment)
    private userEquipmentRepository: Repository<UserEquipment>,
    private userService: UserService,
  ) {}

  /**
   * Add experience and coins to user
   * Applies equipment bonus and handles levelups
   * @param userId user id
   * @param xpAmount how much xp to add
   * @param coinsAmount how many coins to add
   * @param transactionDescription transaction of coins description
   * @returns progression result, with xp and coins gained
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
    let initialLevel = user.level;

    // While to handle multiples levelups at once
    while (user.currentXp >= user.xpToNextLevel) {
      user.currentXp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = this.calculateXpForNextLevel(user.level);
      leveledUp = true;
    }

    // Save changes on user
    await this.userRepository.save(user);

    // TODO: Añadir monedas con WalletService
    // Este paso se implementará cuando tengamos el WalletService
    // await this.walletService.addCoins(userId, adjustedCoins, transactionDescription);

    // TODO: Verificar logros con AchievementService
    // Este paso se implementará cuando tengamos el AchievementService
    // if (leveledUp) {
    //   await this.achievementService.checkLevelAchievements(userId, user.level);
    // }

    // Return result
    return {
      xpGained: adjustedXp,
      coinsGained: adjustedCoins,
      currentXp: user.currentXp,
      xpToNextLevel: user.xpToNextLevel,
      currentLevel: user.level,
      leveledUp,
    };
  }

  /**
   * Calculates bonuses depending on active equipment
   * @param userId user id
   * @returns xp and coins multipliers
   */
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

  /**
   * Veryfy which equipment is equipped
   * @param userId user id
   * @returns map with types of equipment
   */
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

  /**
   * Calculates and returns the user stats, including bonuses
   * @param userID user id
   * @returns stats wit bonuses applied
   */
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
