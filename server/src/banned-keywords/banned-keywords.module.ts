import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannedKeywordsService } from './banned-keywords.service';
import { BannedKeywordsController } from './banned-keywords.controller';
import { BannedKeywordRepository } from '@/database/repositories/banned-keyword.repository';
import { BannedKeyword } from '@/database/entities/banned-keyword.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BannedKeyword])],
  controllers: [BannedKeywordsController],
  providers: [BannedKeywordsService, BannedKeywordRepository],
  exports: [BannedKeywordsService, BannedKeywordRepository],
})
export class BannedKeywordsModule {}
