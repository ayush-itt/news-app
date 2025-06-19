import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { KeywordRepository } from '../database/repositories/keyword.repository';
import { CategoriesService } from '../categories/categories.service';
import { Keyword } from '../database/entities/keyword.entity';
import { CreateKeywordDto, UpdateKeywordDto } from './dto';

@Injectable()
export class KeywordsService {
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async createKeyword(
    userId: number,
    createDto: CreateKeywordDto,
  ): Promise<Keyword> {
    // Verify category exists
    await this.categoriesService.getCategoryById(createDto.category_id);

    // Check if user already has this keyword for this category
    const existingKeyword =
      await this.keywordRepository.existsByUserCategoryKeyword(
        userId,
        createDto.category_id,
        createDto.keyword.toLowerCase().trim(),
      );

    if (existingKeyword) {
      throw new ConflictException(
        'You already have this keyword for this category',
      );
    }

    try {
      const keyword = await this.keywordRepository.create({
        ...createDto,
        user_id: userId,
        keyword: createDto.keyword.toLowerCase().trim(),
      });

      return keyword;
    } catch {
      throw new BadRequestException('Failed to create keyword');
    }
  }

  async findAllKeywords(): Promise<Keyword[]> {
    return await this.keywordRepository.findAll();
  }

  async findUserKeywords(userId: number): Promise<Keyword[]> {
    return await this.keywordRepository.findByUserId(userId);
  }

  async findUserKeywordsByCategory(
    userId: number,
    categoryId: number,
  ): Promise<Keyword[]> {
    // Verify category exists
    await this.categoriesService.getCategoryById(categoryId);

    return await this.keywordRepository.findByUserAndCategory(
      userId,
      categoryId,
    );
  }

  async findKeywordById(id: number): Promise<Keyword> {
    const keyword = await this.keywordRepository.findById(id);
    if (!keyword) {
      throw new NotFoundException('Keyword not found');
    }
    return keyword;
  }

  async updateKeyword(
    id: number,
    userId: number,
    updateDto: UpdateKeywordDto,
  ): Promise<Keyword> {
    const keyword = await this.findKeywordById(id);

    // Check if user owns this keyword
    if (keyword.user_id !== userId) {
      throw new ForbiddenException('You can only update your own keywords');
    }

    // If updating keyword text, check for conflicts
    if (updateDto.keyword) {
      const trimmedKeyword = updateDto.keyword.toLowerCase().trim();
      const existingKeyword =
        await this.keywordRepository.existsByUserCategoryKeyword(
          userId,
          keyword.category_id,
          trimmedKeyword,
          id, // Exclude current keyword
        );

      if (existingKeyword) {
        throw new ConflictException(
          'You already have this keyword for this category',
        );
      }

      updateDto.keyword = trimmedKeyword;
    }

    const updatedKeyword = await this.keywordRepository.update(id, updateDto);
    if (!updatedKeyword) {
      throw new BadRequestException('Failed to update keyword');
    }

    return updatedKeyword;
  }

  async deleteKeyword(id: number, userId: number): Promise<void> {
    const keyword = await this.findKeywordById(id);

    // Check if user owns this keyword
    if (keyword.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own keywords');
    }

    const deleted = await this.keywordRepository.delete(id);
    if (!deleted) {
      throw new BadRequestException('Failed to delete keyword');
    }
  }

  async toggleKeywordActive(id: number, userId: number): Promise<Keyword> {
    const keyword = await this.findKeywordById(id);

    // Check if user owns this keyword
    if (keyword.user_id !== userId) {
      throw new ForbiddenException('You can only modify your own keywords');
    }

    const updatedKeyword = await this.keywordRepository.update(id, {
      is_active: !keyword.is_active,
    });

    if (!updatedKeyword) {
      throw new BadRequestException('Failed to toggle keyword status');
    }

    return updatedKeyword;
  }

  async getUserKeywordCount(userId: number): Promise<number> {
    return await this.keywordRepository.getUserKeywordCount(userId);
  }

  async getKeywordsByCategory(categoryId: number): Promise<Keyword[]> {
    // Verify category exists
    await this.categoriesService.getCategoryById(categoryId);

    return await this.keywordRepository.getKeywordsByCategory(categoryId);
  }
}
