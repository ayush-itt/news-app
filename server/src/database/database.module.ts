import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRepository, RoleRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UserRepository, RoleRepository],
  exports: [UserRepository, RoleRepository],
})
export class DatabaseModule {}
