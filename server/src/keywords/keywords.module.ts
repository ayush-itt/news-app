import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordsController } from './keywords.controller';
import { KeywordsService } from './keywords.service';
import { Keyword } from '../database/entities/keyword.entity';
import { KeywordRepository } from '../database/repositories/keyword.repository';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Keyword]), CategoriesModule],
  controllers: [KeywordsController],
  providers: [KeywordsService, KeywordRepository],
  exports: [KeywordsService, KeywordRepository],
})
export class KeywordsModule {}
