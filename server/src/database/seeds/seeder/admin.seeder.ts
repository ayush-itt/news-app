import { DataSource } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { UserRepository } from '@/database/repositories';
import { adminToAdd } from '../data/admin';

export class AdminSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const userRepository = new UserRepository(dataSource.getRepository(User));

    const existingAdmin = await userRepository.findByUsername(
      adminToAdd.username,
    );

    if (existingAdmin) {
      console.log('Admin user already seeded');
      return;
    }

    console.log('Seeding admin user...');

    await userRepository.create(adminToAdd, adminToAdd.roleId);

    console.log('Admin user seeded successfully');
  }
}
