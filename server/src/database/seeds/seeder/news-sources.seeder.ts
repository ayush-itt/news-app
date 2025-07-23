import { DataSource } from 'typeorm';
import { NewsSource } from '@/database/entities/news-source.entity';
import { NewsSourceRepository } from '@/database/repositories';
import { newsSourcesToAdd } from '../data/news-sources';

export class NewsSourceSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const newsSourceRepository = new NewsSourceRepository(
      dataSource.getRepository(NewsSource),
    );

    const existingNewsSources = await newsSourceRepository.findAll();
    if (existingNewsSources.length > 0) {
      console.log('News sources already seeded');
      return;
    }

    console.log('Seeding news sources...');

    for (const newsSourceData of newsSourcesToAdd) {
      await newsSourceRepository.create(newsSourceData);
    }

    console.log(`${newsSourcesToAdd.length} news sources seeded successfully`);
  }
}
