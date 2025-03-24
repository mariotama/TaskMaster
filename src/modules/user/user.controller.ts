import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProgressionService } from 'src/common/progression/progression.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly progressionService: ProgressionService,
  ) {}

  /**
   * Obtains user profile
   * @param user user obtained from JWT token
   * @returns perfil data
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.userService.findById(user.id);
  }

  /**
   * Updates the actual user profile
   * @param user user obtained from JWT token
   * @param updateUserDto data to update
   * @returns updated profile
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(user.id, updateUserDto);
  }

  /**
   * Obtains stats from user with bonuses applied
   * @param user user obtained from JWT token
   * @returns User stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@CurrentUser() user: User): Promise<any> {
    return this.progressionService.getUserStats(user.id);
  }

  /**
   * Obtains user from id (admin)
   * @param id user ID
   * @returns user data
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  /**
   * Obtains all users (paged) (admin)
   * @param page page number
   * @param limit user per page limit
   * @returns paged user list
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    return this.userService.findAll(page, limit);
  }

  /**
   * Deletes user (admin)
   * @param id user ID to delete
   * @returns confirm message
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.userService.remove(id);
    return {
      success: true,
      message: `Usuario con ID ${id} eliminado correctamente`,
    };
  }
}
