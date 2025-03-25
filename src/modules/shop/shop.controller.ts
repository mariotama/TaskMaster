import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EquipmentType } from 'src/shared/enums/equipment-type.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { EquipmentResponseDto, CreateEquipmentDto } from './dto/equipment.dto';
import { UserEquipmentResponseDto } from './dto/purchase.dto';
import { ShopService } from './shop.service';

/**
 * Equipment shop
 * Handles shop and inventory
 */
@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  /**
   * Obtains equipment available for user
   * @param user actual user
   * @returns avaiable equipment list
   */
  @Get()
  async getAvailableEquipment(
    @CurrentUser() user: User,
  ): Promise<EquipmentResponseDto[]> {
    return this.shopService.getAvailableEquipment(user.id);
  }

  /**
   * Obtains complete equipment catalog with filters (admin)
   * @param type type filter
   * @param rarity rarity filter
   * @param minLevel min level filter
   * @returns Complete equipment catalog
   */
  @Get('catalog')
  async getAllEquipment(
    @Query('type', new ParseEnumPipe(EquipmentType, { optional: true }))
    type?: EquipmentType,
    @Query('rarity') rarity?: string,
    @Query('minLevel', new ParseIntPipe({ optional: true })) minLevel?: number,
  ): Promise<EquipmentResponseDto[]> {
    return this.shopService.findAllEquipment({ type, rarity, minLevel });
  }

  /**
   * Creates new equipment (admin)
   * @param createEquipmentDto equipment data
   * @returns created equipment
   */
  @Post('catalog')
  async createEquipment(
    @Body() createEquipmentDto: CreateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.shopService.createEquipment(createEquipmentDto);
  }

  /**
   * Obtains details from a specific item
   * @param id equiupment id
   * @returns equipment found
   */
  @Get('catalog/:id')
  async getEquipmentDetails(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EquipmentResponseDto> {
    return this.shopService.findOneEquipment(id);
  }

  /**
   * Obtains user inventory
   * @param user actual user
   * @returns equipment inventory
   */
  @Get('inventory')
  async getUserInventory(
    @CurrentUser() user: User,
  ): Promise<UserEquipmentResponseDto[]> {
    return this.shopService.getUserInventory(user.id);
  }

  /**
   * Buys item for user
   * @param user actual user
   * @param equipmentId equipment id from shop
   * @returns bought equipment
   */
  @Post('purchase/:equipmentId')
  async purchaseEquipment(
    @CurrentUser() user: User,
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    return this.shopService.purchaseEquipment(user.id, equipmentId);
  }

  /**
   * Equips inventory item
   * @param user actual user
   * @param userEquipmentId equipment id from inventory
   * @returns Equipamiento equipado
   */
  @Post('equip/:userEquipmentId')
  async equipItem(
    @CurrentUser() user: User,
    @Param('userEquipmentId', ParseIntPipe) userEquipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    return this.shopService.equipItem(user.id, userEquipmentId);
  }

  /**
   * Unequips an item
   * @param user actual user
   * @param userEquipmentId inventory equipment id
   * @returns Unequiped item
   */
  @Post('unequip/:userEquipmentId')
  async unequipItem(
    @CurrentUser() user: User,
    @Param('userEquipmentId', ParseIntPipe) userEquipmentId: number,
  ): Promise<UserEquipmentResponseDto> {
    return this.shopService.unequipItem(user.id, userEquipmentId);
  }

  /**
   * Stats from active equipment
   * @param user actual user
   * @returns equipment stats
   */
  @Get('stats')
  async getEquippedStats(@CurrentUser() user: User) {
    return this.shopService.getEquippedStats(user.id);
  }
}
