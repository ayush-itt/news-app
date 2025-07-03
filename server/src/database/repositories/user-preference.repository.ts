import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserPreference } from '../entities/user-preference.entity';

@Injectable()
export class UserPreferenceRepository extends Repository<UserPreference> {
  constructor(private dataSource: DataSource) {
    super(UserPreference, dataSource.createEntityManager());
  }

  async findByUserId(userId: number): Promise<UserPreference[]> {
    return this.find({
      where: { userId: userId },
      relations: ['category'],
      order: { category: { name: 'ASC' } },
    });
  }

  async findByUserAndCategory(
    userId: number,
    categoryId: number,
  ): Promise<UserPreference | null> {
    return this.findOne({
      where: { userId: userId, categoryId: categoryId },
      relations: ['category'],
    });
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
