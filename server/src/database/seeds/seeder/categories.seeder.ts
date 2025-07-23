import { DataSource } from 'typeorm';
import { Category } from '@/database/entities/category.entity';
import { CategoryRepository } from '@/database/repositories';
import { categoriesToAdd } from '../data/categories';

export class CategorySeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const categoryRepository = new CategoryRepository(
      dataSource.getRepository(Category),
    );

    const existingCategories = await categoryRepository.findAll(false);
    if (existingCategories.length > 0) {
      console.log('Categories already seeded');
      return;
    }

    console.log('Seeding categories...');

    for (const categoryData of categoriesToAdd) {
      await categoryRepository.create(categoryData);
    }

    console.log(`${categoriesToAdd.length} categories seeded successfully`);
  }
}
