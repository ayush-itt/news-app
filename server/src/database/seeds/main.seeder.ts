import { DataSource } from 'typeorm';
import { RoleSeeder } from './seeder/roles.seeder';
import { AdminSeeder } from './seeder/admin.seeder';
import { CategorySeeder } from './seeder/categories.seeder';
import { ArticleSeeder } from './seeder/articles.seeder';
import { LikesSeeder } from './seeder/likes.seeder';
import { BookmarksSeeder } from './seeder/bookmarks.seeder';

export class MainSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    console.log('Starting database seeding...');
    const seeders = [
      RoleSeeder,
      CategorySeeder,
      AdminSeeder,
      ArticleSeeder,
      LikesSeeder,
      BookmarksSeeder,
    ];

    for (const seeder of seeders) {
      await seeder.seed(dataSource);
    }
    console.log('Database seeding completed successfully.');
  }
}
