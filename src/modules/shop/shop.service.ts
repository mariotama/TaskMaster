import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Not, Repository } from 'typeorm';
import { AchievementService } from '../achievement/achievement.service';
import { User } from '../user/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { Equipment } from './entities/equipment.entity';
import { UserEquipment } from './entities/user-equipment.entity';
import {
  CreateEquipmentDto,
  EquipmentResponseDto,
  UpdateEquipmentDto,
} from './dto/equipment.dto';
import { EquipmentType } from 'src/shared/enums/equipment-type.enum';
import { Rarity } from 'src/shared/enums/rarity.enum';
import { UserEquipmentResponseDto } from './dto/purchase.dto';

/**
 * Service for shop and equipment
 * Handles shop, buys, inventory and item equipment
 */
@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(UserEquipment)
    private userEquipmentRepository: Repository<UserEquipment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private walletService: WalletService,
    private achievementService: AchievementService,
  ) {}

  /**
   * Creates a new equipment on the store (admin)
   * @param createEquipmentDto data for creating equipment
   * @returns created equipment
   */
  async createEquipment(
    createEquipmentDto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    await this.equipmentRepository.save(equipment);

    return {
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      icon: equipment.icon,
      type: equipment.type,
      rarity: equipment.rarity,
      price: equipment.price,
      stats: equipment.stats,
      requiredLevel: equipment.requiredLevel,
    };
  }

  /**
   * Updates an existend equipment (admin)
   * @param id equipment id
   * @param updateEquipmentDto data to update
   * @returns updated equipment
   */
  async updateEquipment(
    id: number,
    updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });

    if (!equipment) {
      throw new NotFoundException('Equipamiento no encontrado');
    }

    // Update fields
    Object.assign(equipment, updateEquipmentDto);
    await this.equipmentRepository.save(equipment);

    return {
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      icon: equipment.icon,
      type: equipment.type,
      rarity: equipment.rarity,
      price: equipment.price,
      stats: equipment.stats,
      requiredLevel: equipment.requiredLevel,
    };
  }

  /**
   * Deletes equipment from the store (admin)
   * @param id equipment id
   * @returns true if deleted
   */
  async removeEquipment(id: number): Promise<boolean> {
    const result = await this.equipmentRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Obtains all available equipment
   * @param filters optional filters
   * @returns equipment list
   */
  async findAllEquipment(filters?: {
    type?: EquipmentType;
    rarity?: string;
    minLevel?: number;
  }): Promise<EquipmentResponseDto[]> {
    const whereCondition: {
      type?: EquipmentType;
      rarity?: Rarity;
      requiredLevel?: number;
    } = {};

    // Apply filter if exist
    if (filters?.type) {
      whereCondition.type = filters.type;
    }
    if (filters?.rarity) {
      whereCondition.rarity = filters.rarity as Rarity;
    }
    if (filters?.minLevel) {
      whereCondition.requiredLevel = filters.minLevel;
    }

    const equipment = await this.equipmentRepository.find({
      where: whereCondition,
      order: { requiredLevel: 'ASC', price: 'ASC' },
    });

    return equipment.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      type: item.type,
      rarity: item.rarity,
      price: item.price,
      stats: item.stats,
      requiredLevel: item.requiredLevel,
    }));
  }

  /**
   * Obtains one specific equipment item by ID
   * @param id equipment id
   * @returns found equipment
   */
  async findOneEquipment(id: number): Promise<EquipmentResponseDto> {
    const equipment = await this.equipmentRepository.findOne({ where: { id } });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return {
      id: equipment.id,
      name: equipment.name,
      description: equipment.description,
      icon: equipment.icon,
      type: equipment.type,
      rarity: equipment.rarity,
      price: equipment.price,
      stats: equipment.stats,
      requiredLevel: equipment.requiredLevel,
    };
  }

  /**
   * Obtains avaiable equipment for a specific user
   * @param userId user id
   * @returns equipment list filtered by level
   */
  async getAvailableEquipment(userId: number): Promise<EquipmentResponseDto[]> {
    // Obtains user level
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtains equipment IDs of items already bought
    const userEquipment = await this.userEquipmentRepository.find({
      where: { user: { id: userId } },
      relations: ['equipment'],
    });

    const ownedEquipmentIds = userEquipment.map((item) => item.equipment.id);

    // Obtain all avaiable equipment by level
    const availableEquipment = await this.equipmentRepository.find({
      where: {
        requiredLevel: LessThanOrEqual(user.level),
        id:
          ownedEquipmentIds.length > 0 ? Not(In(ownedEquipmentIds)) : undefined,
      },
      order: { requiredLevel: 'ASC', price: 'ASC' },
    });

    return availableEquipment.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      icon: item.icon,
      type: item.type,
      rarity: item.rarity,
      price: item.price,
      stats: item.stats,
      requiredLevel: item.requiredLevel,
    }));
  }

  /**
   * Obtains equipment from a user
   * @param userId user id
   * @returns user equipment list
   */
  async getUserInventory(userId: number): Promise<UserEquipmentResponseDto[]> {
    const inventory = await this.userEquipmentRepository.find({
      where: { user: { id: userId } },
      relations: ['equipment'],
      order: {
        equipment: { type: 'ASC' },
        isEquipped: 'DESC',
        acquiredAt: 'DESC',
      },
    });

    return inventory.map((item) => ({
      id: item.id,
      isEquipped: item.isEquipped,
      acquiredAt: item.acquiredAt,
      userId,
      equipment: {
        id: item.equipment.id,
        name: item.equipment.name,
        icon: item.equipment.icon,
        type: item.equipment.type,
        rarity: item.equipment.rarity,
        stats: item.equipment.stats,
      },
    }));
  }

  /**
   * Buys equipment for a user
   * @param userId user id
   * @param equipmentId equipment id to buy
   * @returns bought equipment
   */
  async purchaseEquipment(
    userId: number,
    equipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    // Obtain user and level
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Obtain equipment
    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    // Verify if user already has the equipment
    const existing = await this.userEquipmentRepository.findOne({
      where: {
        user: { id: userId },
        equipment: { id: equipmentId },
      },
    });

    if (existing) {
      throw new BadRequestException('Equipment already in inventory');
    }

    // Verify lvl required
    if (user.level < equipment.requiredLevel) {
      throw new ForbiddenException(`Requires level ${equipment.requiredLevel}`);
    }

    // Verify enough funds
    const hasFunds = await this.walletService.hasSufficientFunds(
      userId,
      equipment.price,
    );

    if (!hasFunds) {
      throw new BadRequestException('Insufficient funds');
    }

    // Transaction
    await this.walletService.removeCoins(
      userId,
      equipment.price,
      `Equipment bought: ${equipment.name}`,
    );

    // Add equipment to user's inventory
    const userEquipment = this.userEquipmentRepository.create({
      user: { id: userId },
      equipment: { id: equipmentId },
      isEquipped: false, // Unequipped by default
    });

    await this.userEquipmentRepository.save(userEquipment);

    // Verify equipment achievements
    await this.achievementService.checkEquipmentAchievements(userId);

    // Obtain complete data for response
    const savedUserEquipment = await this.userEquipmentRepository.findOne({
      where: { id: userEquipment.id },
      relations: ['equipment'],
    });

    if (!savedUserEquipment) {
      throw new NotFoundException('User equipment not found after saving');
    }

    return {
      id: savedUserEquipment.id,
      isEquipped: savedUserEquipment.isEquipped,
      acquiredAt: savedUserEquipment.acquiredAt,
      userId,
      equipment: {
        id: savedUserEquipment.equipment.id,
        name: savedUserEquipment.equipment.name,
        icon: savedUserEquipment.equipment.icon,
        type: savedUserEquipment.equipment.type,
        rarity: savedUserEquipment.equipment.rarity,
        stats: savedUserEquipment.equipment.stats,
      },
    };
  }

  /**
   * Equips an item for a user
   * @param userId user id
   * @param userEquipmentId user equipment id
   * @returns equipment equipped
   */
  async equipItem(
    userId: number,
    userEquipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    // Verify if item exists and belongs to user
    const userEquipment = await this.userEquipmentRepository.findOne({
      where: { id: userEquipmentId, user: { id: userId } },
      relations: ['equipment'],
    });

    if (!userEquipment) {
      throw new NotFoundException(
        'Equipamiento no encontrado en tu inventario',
      );
    }

    // If its already equipped, do nothing
    if (userEquipment.isEquipped) {
      return {
        id: userEquipment.id,
        isEquipped: userEquipment.isEquipped,
        acquiredAt: userEquipment.acquiredAt,
        userId,
        equipment: {
          id: userEquipment.equipment.id,
          name: userEquipment.equipment.name,
          icon: userEquipment.equipment.icon,
          type: userEquipment.equipment.type,
          rarity: userEquipment.equipment.rarity,
          stats: userEquipment.equipment.stats,
        },
      };
    }

    // Type of equipment
    const equipmentType = userEquipment.equipment.type;

    // Search and unequip equipped items
    const equippedItems = await this.userEquipmentRepository.find({
      where: {
        user: { id: userId },
        isEquipped: true,
        equipment: { type: equipmentType },
      },
    });

    for (const item of equippedItems) {
      item.isEquipped = false;
      await this.userEquipmentRepository.save(item);
    }

    // Equip new item
    userEquipment.isEquipped = true;
    await this.userEquipmentRepository.save(userEquipment);

    return {
      id: userEquipment.id,
      isEquipped: userEquipment.isEquipped,
      acquiredAt: userEquipment.acquiredAt,
      userId,
      equipment: {
        id: userEquipment.equipment.id,
        name: userEquipment.equipment.name,
        icon: userEquipment.equipment.icon,
        type: userEquipment.equipment.type,
        rarity: userEquipment.equipment.rarity,
        stats: userEquipment.equipment.stats,
      },
    };
  }

  /**
   * Unequip item
   * @param userId user id
   * @param userEquipmentId user equipment id
   * @returns unequipped items
   */
  async unequipItem(
    userId: number,
    userEquipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    // Verify if item exists and belongs to user
    const userEquipment = await this.userEquipmentRepository.findOne({
      where: { id: userEquipmentId, user: { id: userId } },
      relations: ['equipment'],
    });

    if (!userEquipment) {
      throw new NotFoundException(
        'Equipamiento no encontrado en tu inventario',
      );
    }

    // If not equipped, do nothing
    if (!userEquipment.isEquipped) {
      return {
        id: userEquipment.id,
        isEquipped: userEquipment.isEquipped,
        acquiredAt: userEquipment.acquiredAt,
        userId,
        equipment: {
          id: userEquipment.equipment.id,
          name: userEquipment.equipment.name,
          icon: userEquipment.equipment.icon,
          type: userEquipment.equipment.type,
          rarity: userEquipment.equipment.rarity,
          stats: userEquipment.equipment.stats,
        },
      };
    }

    // Unequip item
    userEquipment.isEquipped = false;
    await this.userEquipmentRepository.save(userEquipment);

    return {
      id: userEquipment.id,
      isEquipped: userEquipment.isEquipped,
      acquiredAt: userEquipment.acquiredAt,
      userId,
      equipment: {
        id: userEquipment.equipment.id,
        name: userEquipment.equipment.name,
        icon: userEquipment.equipment.icon,
        type: userEquipment.equipment.type,
        rarity: userEquipment.equipment.rarity,
        stats: userEquipment.equipment.stats,
      },
    };
  }

  /**
   * Obtains total stats
   * @param userId user id
   * @returns All equipment combined stats
   */
  async getEquippedStats(userId: number): Promise<{
    xpBonus: number;
    coinBonus: number;
    equippedItems: number;
    itemsByType: Record<EquipmentType, boolean>;
  }> {
    const equippedItems = await this.userEquipmentRepository.find({
      where: {
        user: { id: userId },
        isEquipped: true,
      },
      relations: ['equipment'],
    });

    let xpBonus = 0;
    let coinBonus = 0;
    const itemsByType = {
      [EquipmentType.HEAD]: false,
      [EquipmentType.BODY]: false,
      [EquipmentType.ACCESSORY]: false,
    };

    // Calculate total bonuses
    for (const item of equippedItems) {
      if (item.equipment.stats.xpBonus) {
        xpBonus += item.equipment.stats.xpBonus;
      }

      if (item.equipment.stats.coinBonus) {
        coinBonus += item.equipment.stats.coinBonus;
      }

      // Mark type as equipped
      itemsByType[item.equipment.type] = true;
    }

    return {
      xpBonus,
      coinBonus,
      equippedItems: equippedItems.length,
      itemsByType,
    };
  }
}
