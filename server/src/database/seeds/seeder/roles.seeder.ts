import { DataSource } from 'typeorm';
import { Role } from '@/database/entities/role.entity';
import { RoleRepository } from '@/database/repositories';
import { rolesToAdd } from '../data/roles';

export class RoleSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const roleRepository = new RoleRepository(dataSource.getRepository(Role));

    const existingRoles = await roleRepository.findAll();
    if (existingRoles.length > 0) {
      console.log('Roles already seeded');
      return;
    }

    console.log('Seeding roles...');

    for (const roleData of rolesToAdd) {
      await roleRepository.create(roleData.name, roleData.description);
    }

    console.log('Roles seeded successfully');
  }
}
