import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferenceRepository } from '@/database/repositories/user-preference.repository';
import { CategoryRepository } from '@/database/repositories/category.repository';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { UpdateUserPreferenceDto } from './dto';

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
    const preferences = categories.map((category) => ({
      categoryId: category.id,
      isSubscribed: false,
    }));

    return this.userPreferenceRepository.bulkUpdatePreferences(
      userId,
      preferences,
    );
  }

  async getSubscribedUserPreferences(): Promise<UserPreference[]> {
    return this.userPreferenceRepository.find({
      where: { isSubscribed: true },
      relations: ['user', 'category'],
    });
  }
}
