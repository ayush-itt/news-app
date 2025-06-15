import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  async findByName(name: string): Promise<Role | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }

  async findById(id: number): Promise<Role | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.repository.find();
  }

  async create(name: string, description?: string): Promise<Role> {
    const role = this.repository.create({ name, description });
    return await this.repository.save(role);
  }

  async updateById(
    id: number,
    updateData: Partial<Role>,
  ): Promise<Role | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async exists(name: string): Promise<boolean> {
    const role = await this.findByName(name);
    return !!role;
  }
}
