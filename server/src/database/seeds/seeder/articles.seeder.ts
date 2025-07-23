import { DataSource } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Category } from '../../entities/category.entity';
import { articlesData } from '../data/articles';

export class ArticleSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    console.log('Starting article seeding...');

    const articleRepository = dataSource.getRepository(Article);
    const categoryRepository = dataSource.getRepository(Category);

    const existingArticlesCount = await articleRepository.count();
    if (existingArticlesCount > 0) {
      console.log('Articles already exist, skipping article seeding');
      return;
    }

    for (const articleData of articlesData) {
      try {
        const { categoryIds, ...articleFields } = articleData;

        const categories = await categoryRepository.find({
          where: categoryIds.map((id) => ({ id })),
        });

        if (categories.length !== categoryIds.length) {
          console.warn(
            `Some categories not found for article: "${articleData.title}". Expected ${categoryIds.length}, found ${categories.length}`,
          );
        }

        const article = articleRepository.create({
          ...articleFields,
          categories,
        });

        await articleRepository.save(article);
        console.log(`Created article: "${article.title}"`);
      } catch (error) {
        console.error(`Error creating article "${articleData.title}":`, error);
      }
    }

    console.log('Article seeding completed successfully');
  }
}
