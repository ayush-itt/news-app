import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from '../entities/keyword.entity';

@Injectable()
export class KeywordRepository {
  constructor(
    @InjectRepository(Keyword)
    private readonly repository: Repository<Keyword>,
  ) {}

  async create(keywordData: Partial<Keyword>): Promise<Keyword> {
    const keyword = this.repository.create(keywordData);
    return await this.repository.save(keyword);
  }

  async findAll(): Promise<Keyword[]> {
    return await this.repository.find({
      relations: ['user', 'category'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Keyword[]> {
    return await this.repository.find({
      where: { user_id: userId },
      relations: ['category'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUserAndCategory(
    userId: number,
    categoryId: number,
  ): Promise<Keyword[]> {
    return await this.repository.find({
      where: { user_id: userId, category_id: categoryId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: number): Promise<Keyword | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });
  }

  async findByKeywordAndCategory(
    keyword: string,
    categoryId: number,
  ): Promise<Keyword[]> {
    return await this.repository.find({
      where: { keyword, category_id: categoryId },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updateData: Partial<Keyword>,
  ): Promise<Keyword | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async existsByUserCategoryKeyword(
    userId: number,
    categoryId: number,
    keyword: string,
    excludeId?: number,
  ): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('keyword')
      .where('keyword.user_id = :userId', { userId })
      .andWhere('keyword.category_id = :categoryId', { categoryId })
      .andWhere('keyword.keyword = :keyword', { keyword });

    if (excludeId) {
      query.andWhere('keyword.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async getKeywordsByCategory(categoryId: number): Promise<Keyword[]> {
    return await this.repository.find({
      where: { category_id: categoryId, is_active: true },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getUserKeywordCount(userId: number): Promise<number> {
    return await this.repository.count({
      where: { user_id: userId, is_active: true },
    });
  }
}
