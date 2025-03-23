import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

/*
 * CRUD of Users
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create new user
   * @param createUserDto user data
   * @returns created user (without sensible info)
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verify if e-mail exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered.');
    }

    // Create new user with wallet and settings (cascade)
    const user = this.userRepository.create({
      ...createUserDto,
      wallet: {},
      settings: {},
    });

    // Save user on the db
    await this.userRepository.save(user);

    // Transform to DTO and return user without sensible info
    return new UserResponseDto(user);
  }

  /**
   * Obtain all users (with pagination)
   * @param page : Page number
   * @param limit : Limit
   * @returns list of users with pagination
   */
  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map((user) => new UserResponseDto(user)),
      total,
    };
  }

  /**
   * Search user for ID
   * @param id : user ID
   * @returns found User
   * @throws NotFoundException if user doesn't exists
   */
  async findById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['wallet', 'settings'],
    });

    if (!user) {
      throw new NotFoundException('User with ID ' + id + ' not found.');
    }

    return new UserResponseDto(user);
  }

  /**
   * Search user by e-mail
   * @param email user e-mail
   * @returns found user or null if it doesn't exist
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'username',
        'password',
        'level',
        'currentXp',
        'xpToNextLevel',
      ],
    });
  }

  /**
   * Update user info
   * @param id user ID
   * @param updateUserDto data to update
   * @returns updated user
   * @throws NotFoundException if user doesn't exist
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User with ID ' + id + ' not found.');
    }

    // Encrypt the password if given
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update the given fields
    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);

    return new UserResponseDto(user);
  }

  /**
   * Delete user with ID
   * @param id user id
   * @returns true if user was deleted
   * @throws NotFoundException if user doesn't exist
   */
  async remove(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User with ID ' + id + ' not found.');
    }

    return true;
  }

  /**
   * Update lvl and user XP
   * @param id user ID
   * @param level new level
   * @param currentXp actual XP
   * @param xpToNextLevel needed XP for next level
   * @returns updated user
   */
  async updateProgression(
    id: number,
    level: number,
    currentXp: number,
    xpToNextLevel: number,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User with ID ' + id + ' not found.');
    }

    // Update progression values
    user.level = level;
    user.currentXp = currentXp;
    user.xpToNextLevel = xpToNextLevel;

    await this.userRepository.save(user);

    return new UserResponseDto(user);
  }
}
