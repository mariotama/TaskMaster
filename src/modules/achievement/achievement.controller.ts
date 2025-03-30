import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementService } from './achievement.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { AchievementResponseDto } from './dto/achievement.dto';

/**
 * Controller for achievement handling
 * Handles listing and achievement verifying
 */
@Controller('achievement')
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /**
   * Obtains all user's achievements
   * @param user actual user
   * @returns achievement list
   */
  @Get()
  async findAll(@CurrentUser() user: User): Promise<AchievementResponseDto[]> {
    return this.achievementService.findAll(user.id);
  }

  /**
   * Verifies all user's achievements
   * After an important event
   * @param user actual user
   * @returns Unlocked achievements (if)
   */
  @Post('check')
  async checkAllAchievements(@CurrentUser() user: User) {
    const unlockedAchievements =
      await this.achievementService.checkAllAchievements(user.id);

    return {
      checked: true,
      unlockedCount: unlockedAchievements.length,
      unlockedAchievements: unlockedAchievements.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
      })),
    };
  }

  /**
   * Obtains stats progress
   * @param user actual user
   * @returns Achievements stats
   */
  @Get('stats')
  async getAchievementStats(@CurrentUser() user: User) {
    return this.achievementService.getAchievementStats(user.id);
  }

  /**
   * Obtains specific achievement
   * @param user actual user
   * @param id achievement id
   * @returns Achievement found
   */
  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AchievementResponseDto> {
    return this.achievementService.findOne(id, user.id);
  }
}
