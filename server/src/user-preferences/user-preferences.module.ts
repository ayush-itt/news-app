import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreference } from '@/database/entities/user-preference.entity';
import { Category } from '@/database/entities/category.entity';
import { UserPreferenceRepository } from '@/database/repositories/user-preference.repository';
import { CategoryRepository } from '@/database/repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference, Category])],
  controllers: [UserPreferencesController],
  providers: [
    UserPreferencesService,
    UserPreferenceRepository,
    CategoryRepository,
  ],
  exports: [UserPreferencesService, UserPreferenceRepository],
})
export class UserPreferencesModule {}
