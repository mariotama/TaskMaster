import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from '../user/dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/shared/interfaces/user.interface';
import { LoginDto } from './dto/login.dto';
import { AchievementService } from '../achievement/achievement.service';

/**
 * Service for authentication
 * Handles register, login and token veryfying
 */
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private achievementService: AchievementService,
  ) {}

  /**
   * Register new user
   * @param registerDto register data from user
   * @returns response with JWT token and user data
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verify if user exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userService.create({
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
    });

    // Initialize achievements for new user
    await this.achievementService.initializeAchievements(user.id);

    // Generate token JWT
    const token = this.generateToken(user.id, user.email);

    // Return auth answer
    return new AuthResponseDto({
      user,
      token,
    });
  }

  /**
   * Authenticates an user and generates JWT token
   * @param loginDto login credentials
   * @returns response with JWT token and user data
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Search user for email with password
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    // Crear DTO de respuesta
    const userResponse = new UserResponseDto(user);

    // Return auth response
    return new AuthResponseDto({
      user: userResponse,
      token,
    });
  }

  /**
   * Valida un usuario a partir del payload del token JWT
   * @param payload Payload del token JWT
   * @returns Usuario validado
   * @throws UnauthorizedException si el usuario no existe
   */
  async validateUser(payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Generates a token JWT for the user
   * @param userId user id
   * @param email user email
   * @returns JWT token generated
   */
  private generateToken(userId: number, email: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    return this.jwtService.sign(payload);
  }
}
