import { DataSource } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { Role } from '@/database/entities/role.entity';
import { UserRepository, RoleRepository } from '@/database/repositories';
import { adminToAdd } from '../data/admin';
import { RoleEnum } from '@/common/enums/roles.enum';

export class AdminSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const roleRepository = new RoleRepository(dataSource.getRepository(Role));
    const userRepository = new UserRepository(
      dataSource.getRepository(User),
      roleRepository,
    );

    const existingAdmin = await userRepository.findByUsername(
      adminToAdd.username,
    );

    if (existingAdmin) {
      console.log('Admin user already seeded');
      return;
    }

    console.log('Seeding admin user...');

    await userRepository.create(adminToAdd, RoleEnum.ADMIN);

    console.log('Admin user seeded successfully');
  }
}
