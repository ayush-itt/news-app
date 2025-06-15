import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../../auth/dto/register.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto, roleId: number = 2): Promise<User> {
    const user = this.repository.create({
      ...registerDto,
      roleId,
    });
    return await this.repository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username },
      relations: ['role'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async checkIfExists(username: string, email: string): Promise<boolean> {
    const existingUser = await this.repository.findOne({
      where: [{ username }, { email }],
    });
    return !!existingUser;
  }

  async updateById(
    id: number,
    updateData: Partial<User>,
  ): Promise<User | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      relations: ['role'],
    });
  }

  async findWithPagination(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.repository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }
}
