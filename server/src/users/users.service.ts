import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from '../database/entities/user.entity';
import { UserRepository } from '../database/repositories';

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
}
