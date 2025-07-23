import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferenceRepository } from '@/database/repositories/user-preference.repository';
import { CategoryRepository } from '@/database/repositories/category.repository';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { UpdateUserPreferenceDto } from './dto';
import { IPreferenceData } from './interfaces';

@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getUserPreferences(userId: number): Promise<UserPreference[]> {
    return this.userPreferenceRepository.findByUserId(userId);
  }

  async updatePreference(
    userId: number,
    categoryId: number,
    updateDto: UpdateUserPreferenceDto,
  ): Promise<UserPreference> {
    // First check if the category is active
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    if (!category.isActive) {
      throw new NotFoundException(
        `Category ${categoryId} is not available for preferences`,
      );
    }

    const preference =
      await this.userPreferenceRepository.findByUserAndCategory(
        userId,
        categoryId,
      );

    if (!preference) {
      throw new NotFoundException(
        `Preference for category ${categoryId} not found`,
      );
    }

    if (updateDto.isSubscribed !== undefined) {
      return this.userPreferenceRepository.createOrUpdatePreference(
        userId,
        categoryId,
        updateDto.isSubscribed,
      );
    }

    return preference;
  }

  async initializeDefaultPreferences(
    userId: number,
  ): Promise<UserPreference[]> {
    // Get all active categories
    const categories = await this.categoryRepository.findAll(true);

    // Set user preferences to inactive (unsubscribed) by default
    const preferences: IPreferenceData[] = categories.map((category) => ({
      categoryId: category.id,
      isSubscribed: false,
    }));

    return this.userPreferenceRepository.bulkUpdatePreferences(
      userId,
      preferences,
    );
  }

  async getSubscribedUserPreferences(): Promise<UserPreference[]> {
    // Only return subscribed preferences for active categories
    return this.userPreferenceRepository
      .createQueryBuilder('preference')
      .leftJoinAndSelect('preference.user', 'user')
      .leftJoinAndSelect('preference.category', 'category')
      .where('preference.isSubscribed = :isSubscribed', { isSubscribed: true })
      .andWhere('category.isActive = :isActive', { isActive: true })
      .getMany();
  }
}
