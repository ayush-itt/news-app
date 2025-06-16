import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Category } from './entities/category.entity';
import {
  UserRepository,
  RoleRepository,
  CategoryRepository,
} from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Category])],
  providers: [UserRepository, RoleRepository, CategoryRepository],
  exports: [UserRepository, RoleRepository, CategoryRepository],
})
export class DatabaseModule {}
