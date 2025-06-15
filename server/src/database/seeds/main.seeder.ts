import { DataSource } from 'typeorm';
import { RoleSeeder } from './seeder/roles.seeder';
import { AdminSeeder } from './seeder/admin.seeder';

export class MainSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    console.log('Starting database seeding...');
    const seeders = [RoleSeeder, AdminSeeder];

    for (const seeder of seeders) {
      await seeder.seed(dataSource);
    }
    console.log('Database seeding completed successfully.');
  }
}
