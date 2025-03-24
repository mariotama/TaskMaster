import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from '../user/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controller to handle authentication
 * Handles register, login and verification endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   * @param registerDto register data
   * @returns JWT token and user data
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Authenticates existing user
   * @param loginDto login credentials
   * @returns JWT Token and user data
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Verifies the JWT token
   * @param user user obtained
   * @returns authenticated user data
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      currentXp: user.currentXp,
      xpToNextLevel: user.xpToNextLevel,
    };
  }
}
