import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannedKeyword } from '@/database/entities/banned-keyword.entity';

@Injectable()
export class BannedKeywordRepository {
  constructor(
    @InjectRepository(BannedKeyword)
    private readonly repository: Repository<BannedKeyword>,
  ) {}

  /**
   * Find all active banned keywords
   */
  async findAllActive(): Promise<BannedKeyword[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all banned keywords (including inactive)
   */
  async findAll(): Promise<BannedKeyword[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find banned keyword by ID
   */
  async findById(id: number): Promise<BannedKeyword | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Find banned keyword by keyword text
   */
  async findByKeyword(keyword: string): Promise<BannedKeyword | null> {
    return this.repository.findOne({ where: { keyword } });
  }

  /**
   * Create a new banned keyword
   */
  async create(
    bannedKeywordData: Partial<BannedKeyword>,
  ): Promise<BannedKeyword> {
    const bannedKeyword = this.repository.create(bannedKeywordData);
    return this.repository.save(bannedKeyword);
  }

  /**
   * Update a banned keyword
   */
  async update(
    id: number,
    updateData: Partial<BannedKeyword>,
  ): Promise<BannedKeyword | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  /**
   * Delete a banned keyword
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  /**
   * Check if a keyword exists
   */
  async exists(keyword: string): Promise<boolean> {
    const count = await this.repository.count({ where: { keyword } });
    return count > 0;
  }

  /**
   * Toggle active status of a banned keyword
   */
  async toggleActive(id: number): Promise<BannedKeyword | null> {
    const bannedKeyword = await this.findById(id);
    if (!bannedKeyword) {
      return null;
    }
    return this.update(id, { isActive: !bannedKeyword.isActive });
  }
}
