import { DataSource } from 'typeorm';
import { RoleSeeder } from './seeder/roles.seeder';
import { AdminSeeder } from './seeder/admin.seeder';
import { CategorySeeder } from './seeder/categories.seeder';
import { NewsSourceSeeder } from './seeder/news-sources.seeder';
import { ArticleSeeder } from './seeder/articles.seeder';
import { UserReactionsSeeder } from './seeder/user-reactions.seeder';
import { BookmarksSeeder } from './seeder/bookmarks.seeder';

export class MainSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    console.log('Starting database seeding...');
    const seeders = [
      RoleSeeder,
      CategorySeeder,
      NewsSourceSeeder,
      AdminSeeder,
      ArticleSeeder,
      UserReactionsSeeder,
      BookmarksSeeder,
    ];

    for (const seeder of seeders) {
      await seeder.seed(dataSource);
    }
    console.log('Database seeding completed successfully.');
  }
}
