import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NewsSourceRepository } from '../database/repositories/news-source.repository';
import {
  NewsSource,
  NewsSourceType,
} from '../database/entities/news-source.entity';
import { CreateNewsSourceDto, UpdateNewsSourceDto } from './dto';

@Injectable()
export class NewsSourcesService {
  constructor(private readonly newsSourceRepository: NewsSourceRepository) {}

  async createNewsSource(createDto: CreateNewsSourceDto): Promise<NewsSource> {
    // Check if name already exists
    const existingSource = await this.newsSourceRepository.findByName(
      createDto.name,
    );
    if (existingSource) {
      throw new ConflictException('News source with this name already exists');
    }

    try {
      const newsSource = await this.newsSourceRepository.create({
        ...createDto,
      });

      return newsSource;
    } catch {
      throw new BadRequestException('Failed to create news source');
    }
  }

  async findAllNewsSources(): Promise<NewsSource[]> {
    return await this.newsSourceRepository.findAll();
  }

  async findActiveNewsSources(): Promise<NewsSource[]> {
    return await this.newsSourceRepository.findActive();
  }

  async findNewsSourceById(id: number): Promise<NewsSource> {
    const newsSource = await this.newsSourceRepository.findById(id);
    if (!newsSource) {
      throw new NotFoundException(`News source with ID ${id} not found`);
    }
    return newsSource;
  }

  async findNewsSourcesByType(type: NewsSourceType): Promise<NewsSource[]> {
    return await this.newsSourceRepository.findByType(type);
  }

  async updateNewsSource(
    id: number,
    updateDto: UpdateNewsSourceDto,
  ): Promise<NewsSource> {
    const existingSource = await this.findNewsSourceById(id);

    // Check if name is being updated and if it conflicts with another source
    if (updateDto.name && updateDto.name !== existingSource.name) {
      const nameExists = await this.newsSourceRepository.existsByName(
        updateDto.name,
        id,
      );
      if (nameExists) {
        throw new ConflictException(
          'Another news source with this name already exists',
        );
      }
    }

    const updatedSource = await this.newsSourceRepository.update(id, updateDto);
    if (!updatedSource) {
      throw new NotFoundException(`News source with ID ${id} not found`);
    }

    return updatedSource;
  }

  async deleteNewsSource(id: number): Promise<void> {
    await this.findNewsSourceById(id); // Verify source exists
    const deleted = await this.newsSourceRepository.delete(id);

    if (!deleted) {
      throw new BadRequestException('Failed to delete news source');
    }
  }

  async updateLastFetch(id: number): Promise<void> {
    await this.findNewsSourceById(id); // Verify source exists
    await this.newsSourceRepository.updateLastFetch(id);
  }

  async toggleSourceActive(id: number): Promise<NewsSource> {
    const newsSource = await this.findNewsSourceById(id);
    const updatedSource = await this.newsSourceRepository.update(id, {
      isActive: !newsSource.isActive,
    });

    if (!updatedSource) {
      throw new BadRequestException('Failed to toggle news source status');
    }

    return updatedSource;
  }

  async getSourcesStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    return await this.newsSourceRepository.getSourcesStatistics();
  }

  async checkSourceHealth(id: number): Promise<{
    id: number;
    name: string;
    lastFetchAt: Date | null;
    lastError: string | null;
    isHealthy: boolean;
  }> {
    const source = await this.findNewsSourceById(id);

    const isHealthy = source.isActive && !source.lastError;

    return {
      id: source.id,
      name: source.name,
      lastFetchAt: source.lastFetchAt,
      lastError: source.lastError,
      isHealthy,
    };
  }
}
