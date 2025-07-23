import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPreference } from '../entities/user-preference.entity';

@Injectable()
export class UserPreferenceRepository extends Repository<UserPreference> {
  constructor(private dataSource: DataSource) {
    super(UserPreference, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<UserPreference[]> {
    // Only return preferences for active categories
    return this.createQueryBuilder('preference')
      .leftJoinAndSelect('preference.category', 'category')
      .where('preference.userId = :userId', { userId })
      .andWhere('category.isActive = :isActive', { isActive: true })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  async findByUserAndCategory(
    userId: number,
    categoryId: number,
  ): Promise<UserPreference | null> {
    // Only return preference if category is active
    return this.createQueryBuilder('preference')
      .leftJoinAndSelect('preference.category', 'category')
      .where('preference.userId = :userId', { userId })
      .andWhere('preference.categoryId = :categoryId', { categoryId })
      .andWhere('category.isActive = :isActive', { isActive: true })
      .getOne();
  }

  async createOrUpdatePreference(
    userId: number,
    categoryId: number,
    isSubscribed: boolean,
  ): Promise<UserPreference> {
    const existingPreference = await this.findByUserAndCategory(
      userId,
      categoryId,
    );

    if (existingPreference) {
      existingPreference.isSubscribed = isSubscribed;
      return this.save(existingPreference);
    }

    // For new preferences, we should validate that the category is active
    // However, since this method is also used during bulk operations,
    // we'll handle validation at the service level
    const newPreference = this.create({
      userId: userId,
      categoryId: categoryId,
      isSubscribed: isSubscribed,
    });

    return this.save(newPreference);
  }

  async bulkUpdatePreferences(
    userId: number,
    preferences: Array<{ categoryId: number; isSubscribed: boolean }>,
  ): Promise<UserPreference[]> {
    const results: UserPreference[] = [];

    for (const pref of preferences) {
      const result = await this.createOrUpdatePreference(
        userId,
        pref.categoryId,
        pref.isSubscribed,
      );
      results.push(result);
    }

    return results;
  }
}
