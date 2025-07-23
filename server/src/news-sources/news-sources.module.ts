import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsSourcesController } from './news-sources.controller';
import { NewsSourcesService } from './news-sources.service';
import { NewsSource } from '../database/entities/news-source.entity';
import { NewsSourceRepository } from '../database/repositories/news-source.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NewsSource])],
  controllers: [NewsSourcesController],
  providers: [NewsSourcesService, NewsSourceRepository],
  exports: [NewsSourcesService, NewsSourceRepository],
})
export class NewsSourcesModule {}
