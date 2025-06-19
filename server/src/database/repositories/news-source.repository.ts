import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsSource, NewsSourceType } from '../entities/news-source.entity';

@Injectable()
export class NewsSourceRepository {
  constructor(
    @InjectRepository(NewsSource)
    private readonly repository: Repository<NewsSource>,
  ) {}

  async create(newsSourceData: Partial<NewsSource>): Promise<NewsSource> {
    const newsSource = this.repository.create(newsSourceData);
    return await this.repository.save(newsSource);
  }

  async findAll(): Promise<NewsSource[]> {
    return await this.repository.find({
      order: { created_at: 'ASC' },
    });
  }

  async findActive(): Promise<NewsSource[]> {
    return await this.repository.find({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });
  }

  async findById(id: number): Promise<NewsSource | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<NewsSource | null> {
    return await this.repository.findOne({
      where: { name },
    });
  }

  async findByType(type: NewsSourceType): Promise<NewsSource[]> {
    return await this.repository.find({
      where: { type },
      order: { created_at: 'ASC' },
    });
  }

  async update(
    id: number,
    updateData: Partial<NewsSource>,
  ): Promise<NewsSource | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async updateLastFetch(id: number): Promise<void> {
    await this.repository.update(id, {
      last_fetch_at: new Date(),
      last_error: null,
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('newsSource')
      .where('newsSource.name = :name', { name });

    if (excludeId) {
      query.andWhere('newsSource.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }

  async getActiveSourcesCount(): Promise<number> {
    return await this.repository.count({
      where: { is_active: true },
    });
  }

  async getSourcesStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.repository.count(),
      this.repository.count({
        where: { is_active: true },
      }),
      this.repository.count({
        where: { is_active: false },
      }),
    ]);

    return { total, active, inactive };
  }
}
