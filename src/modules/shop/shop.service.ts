import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
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
export class ShopService implements OnModuleInit {
  private readonly equipmentDefinitions = [
    // HEAD
    {
      name: 'Basic Cap',
      description: 'A simple cap that provides basic protection',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746638497/ChatGPT_Image_7_may_2025_19_21_17_ychtyx.png',
      type: EquipmentType.HEAD,
      rarity: Rarity.COMMON,
      price: 100,
      stats: { xpBonus: 5 },
      requiredLevel: 1,
    },
    {
      name: 'Focus Helmet',
      description: 'Enhances your focus and mental clarity',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746638497/ChatGPT_Image_7_may_2025_19_21_20_fqeyon.png',
      type: EquipmentType.HEAD,
      rarity: Rarity.RARE,
      price: 300,
      stats: { xpBonus: 10 },
      requiredLevel: 5,
    },
    {
      name: 'Crown of Wisdom',
      description: 'A legendary crown that maximizes your productivity',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746638497/ChatGPT_Image_7_may_2025_19_21_21_rsjgvf.png',
      type: EquipmentType.HEAD,
      rarity: Rarity.EPIC,
      price: 1000,
      stats: { xpBonus: 20 },
      requiredLevel: 15,
    },

    // BODY
    {
      name: 'Task Vest',
      description: 'A comfortable vest with plenty of pockets',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746639700/ChatGPT_Image_7_may_2025_19_41_29_ew37ze.png',
      type: EquipmentType.BODY,
      rarity: Rarity.COMMON,
      price: 100,
      stats: { coinBonus: 5 },
      requiredLevel: 1,
    },
    {
      name: 'Productivity Suit',
      description: 'Gives you an efficient and professional appearance',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746641314/ChatGPT_Image_7_may_2025_20_08_27_ncxdi0.png',
      type: EquipmentType.BODY,
      rarity: Rarity.RARE,
      price: 400,
      stats: { coinBonus: 15 },
      requiredLevel: 7,
    },
    {
      name: 'Legendary Armor of Efficiency',
      description: 'Made from the scales of the most productive dragons',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746641415/ChatGPT_Image_7_may_2025_20_10_06_kcn7xe.png',
      type: EquipmentType.BODY,
      rarity: Rarity.EPIC,
      price: 1200,
      stats: { xpBonus: 10, coinBonus: 20 },
      requiredLevel: 20,
    },

    // ACCESORIES
    {
      name: 'Focus Stone',
      description: 'A small stone that helps maintain concentration',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746641557/ChatGPT_Image_7_may_2025_20_12_29_jupmav.png',
      type: EquipmentType.ACCESSORY,
      rarity: Rarity.COMMON,
      price: 50,
      stats: { xpBonus: 3, coinBonus: 2 },
      requiredLevel: 1,
    },
    {
      name: 'Time Amulet',
      description: 'An amulet that helps manage your time more efficiently',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746641690/ChatGPT_Image_7_may_2025_20_14_41_cur2wn.png',
      type: EquipmentType.ACCESSORY,
      rarity: Rarity.RARE,
      price: 250,
      stats: { xpBonus: 7, coinBonus: 7 },
      requiredLevel: 5,
    },
    {
      name: 'Infinity Gauntlet of Productivity',
      description: 'Legendary accessory that maximizes all your capabilities',
      icon: 'https://res.cloudinary.com/dgtskm40t/image/upload/v1746976055/ChatGPT_Image_11_may_2025_17_06_43_y99jmm.png',
      type: EquipmentType.ACCESSORY,
      rarity: Rarity.EPIC,
      price: 1500,
      stats: { xpBonus: 15, coinBonus: 15 },
      requiredLevel: 25,
    },
  ];
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
   * This method is called when the module is initialized
   * Verifies if the equipment catalog is empty
   * If empty, initializes the equipment catalog with default values
   */
  async onModuleInit() {
    try {
      // Verificar si ya existe equipamiento en la base de datos
      const count = await this.equipmentRepository.count();

      // Si no hay equipamiento, inicializarlo
      if (count === 0) {
        console.log('Initializing equipment catalog...');
        await this.initializeEquipment();
      } else {
        console.log(`Already existing catalog with ${count} pieces.`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  /**
   * Method to initialize the equipment catalog
   * Creates and saves the default equipment defined in the class
   */
  private async initializeEquipment() {
    try {
      // Crear y guardar cada pieza de equipamiento definida
      const equipment = this.equipmentDefinitions.map((def) =>
        this.equipmentRepository.create(def),
      );

      await this.equipmentRepository.save(equipment);
      console.log(`Created ${equipment.length} equipment pieces.`);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  /**
   * Method to update the equipment catalog
   * Useful for adding new equipment definitions
   */
  async updateEquipmentCatalog() {
    // Obtener todo el equipamiento existente
    const existingEquipment = await this.equipmentRepository.find();
    const existingNames = existingEquipment.map((item) => item.name);

    // Encontrar definiciones que no existen en la base de datos
    const newDefinitions = this.equipmentDefinitions.filter(
      (def) => !existingNames.includes(def.name),
    );

    if (newDefinitions.length === 0) {
      return {
        updated: false,
        message: 'There is no new equipmente pieces.',
        count: 0,
      };
    }

    // Crear y guardar el nuevo equipamiento
    const newEquipment = newDefinitions.map((def) =>
      this.equipmentRepository.create(def),
    );

    await this.equipmentRepository.save(newEquipment);

    return {
      updated: true,
      message: `${newEquipment.length} pieces added.`,
      count: newEquipment.length,
    };
  }

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
