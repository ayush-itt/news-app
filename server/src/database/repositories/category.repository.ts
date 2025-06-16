import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.repository.create(categoryData);
    return await this.repository.save(category);
  }
  async findAll(activeOnly: boolean = true): Promise<Category[]> {
    const query = this.repository.createQueryBuilder('category');

    if (activeOnly) {
      query.where('category.isActive = :isActive', { isActive: true });
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Category | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { slug },
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }

  async updateById(
    id: number,
    updateData: Partial<Category>,
  ): Promise<Category | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async checkIfExists(name: string, slug: string): Promise<boolean> {
    const existingCategory = await this.repository.findOne({
      where: [{ name }, { slug }],
    });
    return !!existingCategory;
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ categories: Category[]; total: number }> {
    const [categories, total] = await this.repository.findAndCount({
      where: { isActive: true },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { categories, total };
  }

  async findByIds(ids: number[]): Promise<Category[]> {
    if (ids.length === 0) {
      return [];
    }
    return await this.repository.findByIds(ids);
  }
}
