import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../database/entities/user.entity';
import { UserRepository } from '../database/repositories';
import { AUTH_CONSTANTS } from '../auth/constants';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(registerDto: RegisterDto): Promise<User> {
    return await this.userRepository.create(registerDto);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async checkIfUserExists(username: string, email: string): Promise<boolean> {
    return await this.userRepository.checkIfExists(username, email);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number }> {
    return await this.userRepository.findWithPagination(page, limit);
  }

  async updateUser(
    id: number,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return await this.userRepository.updateById(id, updateData);
  }

  async deleteUser(id: number): Promise<boolean> {
    return await this.userRepository.deleteById(id);
  }

  async register(registerRequest: RegisterDto): Promise<{ message: string }> {
    const { username, email } = registerRequest;

    const userExists = await this.checkIfUserExists(username, email);

    if (userExists) {
      throw new ConflictException(AUTH_CONSTANTS.MESSAGES.USER_EXISTS);
    }

    try {
      await this.createUser(registerRequest);

      return {
        message: AUTH_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
      };
    } catch {
      throw new BadRequestException(
        AUTH_CONSTANTS.MESSAGES.USER_CREATION_FAILED,
      );
    }
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: User }> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for conflicts with username/email if they're being updated
    if (updateUserDto.username || updateUserDto.email) {
      const { username, email } = updateUserDto;

      // Check username uniqueness
      if (username && username !== existingUser.username) {
        const userWithUsername =
          await this.userRepository.findByUsername(username);
        if (userWithUsername) {
          throw new ConflictException('Username already exists');
        }
      }

      // Check email uniqueness
      if (email && email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(email);
        if (userWithEmail) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    try {
      const updatedUser = await this.userRepository.updateById(
        id,
        updateUserDto,
      );
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return {
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUserById(id: number): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      const isDeleted = await this.userRepository.deleteById(id);
      if (!isDeleted) {
        throw new BadRequestException('Failed to delete user');
      }

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
