import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '@/database/entities/article.entity';
import { Category } from '@/database/entities/category.entity';
import {
  NewsSource,
  NewsSourceType,
} from '@/database/entities/news-source.entity';

// TheNewsAPI response interfaces
interface TheNewsApiArticle {
  title: string;
  snippet: string;
  url: string;
  image_url: string | null;
  published_at: string; // Keep as is - this is the API response format
  source: string;
  categories: string[];
}

@Injectable()
export class SimpleNewsApiService {
  private readonly API_KEY = 'GTZxjMgmvJ4PJR8vEU8ntK9ZGvL03ULMSZQGtM6d'; // Replace with actual API key

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(NewsSource)
    private readonly newsSourceRepository: Repository<NewsSource>,
  ) {}
  async fetchAndStoreArticles(): Promise<void> {
    console.log(
      '[SimpleNewsApiService] Starting to fetch articles from TheNewsAPI',
    );

    try {
      // Step 1: Get TheNewsAPI source configuration
      const newsSource = await this.getTheNewsApiSource();
      if (!newsSource) {
        throw new Error('TheNewsAPI source not found in database');
      }

      // Step 2: Fetch articles from TheNewsAPI
      const articles = await this.fetchFromTheNewsApi(newsSource);
      console.log(
        `[SimpleNewsApiService] Fetched ${articles.length} articles from TheNewsAPI`,
      );

      // Step 3: Get available categories from DB
      const availableCategories = await this.getAvailableCategories();
      console.log(
        `[SimpleNewsApiService] Found ${availableCategories.length} categories in DB`,
      );

      // Step 4: Transform and store articles
      let storedCount = 0;
      for (const apiArticle of articles) {
        try {
          await this.transformAndStoreArticle(apiArticle, availableCategories);
          storedCount++;
        } catch (error) {
          console.error(
            `[SimpleNewsApiService] Failed to store article: ${apiArticle.title}`,
            error,
          );
        }
      }

      // Step 5: Update news source status
      await this.updateNewsSourceStatus(newsSource, null);

      console.log(
        `[SimpleNewsApiService] Successfully stored ${storedCount} out of ${articles.length} articles`,
      );
    } catch (error) {
      console.error(
        '[SimpleNewsApiService] Error in fetchAndStoreArticles:',
        error,
      );
      // Update error status
      const newsSource = await this.getTheNewsApiSource();
      if (newsSource) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        await this.updateNewsSourceStatus(newsSource, errorMessage);
      }

      throw error;
    }
  }

  private async getTheNewsApiSource(): Promise<NewsSource | null> {
    return await this.newsSourceRepository.findOne({
      where: {
        type: NewsSourceType.THENEWSAPI,
        isActive: true,
      },
    });
  }

  private async fetchFromTheNewsApi(
    newsSource: NewsSource,
  ): Promise<TheNewsApiArticle[]> {
    const apiKey = newsSource.apiKeyEnv || this.API_KEY;
    const allArticles: TheNewsApiArticle[] = [];

    console.log(
      '[SimpleNewsApiService] Making request to TheNewsAPI (pages 1-5)...',
    );

    try {
      // Iterate through pages 1 to 5
      for (let page = 1; page <= 5; page++) {
        console.log(`[SimpleNewsApiService] Fetching page ${page}...`);

        const url = `${newsSource.baseUrl}?api_token=${apiKey}&locale=us&language=en&limit=3&page=${page}`;

        const response = await fetch(url);
        const responseData = (await response.json()) as Record<
          string,
          TheNewsApiArticle[]
        >;

        if (responseData.data) {
          const pageArticleCount = responseData.data.length;
          console.log(
            `[SimpleNewsApiService] Page ${page}: Found ${pageArticleCount} articles`,
          );

          for (const article of responseData.data) {
            allArticles.push(article);
          }

          // If we get fewer articles than requested, we might have reached the end
          if (pageArticleCount < 3) {
            console.log(
              `[SimpleNewsApiService] Page ${page}: Fewer articles than expected, might be the last page`,
            );
          }
        } else {
          console.log(`[SimpleNewsApiService] Page ${page}: No data returned`);
        }

        // Add a small delay between requests to be respectful to the API
        if (page < 5) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log(
        `[SimpleNewsApiService] Total articles fetched from all pages: ${allArticles.length}`,
      );
      return allArticles;
    } catch (error) {
      console.error(
        '[SimpleNewsApiService] Error fetching from TheNewsAPI:',
        error,
      );
      throw error;
    }
  }
  private async getAvailableCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
    });
  }

  private async updateNewsSourceStatus(
    newsSource: NewsSource,
    errorMessage: string | null,
  ): Promise<void> {
    await this.newsSourceRepository.update(newsSource.id, {
      lastFetchAt: new Date(),
      lastError: errorMessage,
    });
  }

  private async transformAndStoreArticle(
    apiArticle: TheNewsApiArticle,
    availableCategories: Category[],
  ): Promise<void> {
    // Skip articles with missing required fields
    if (!apiArticle.title || !apiArticle.url || !apiArticle.published_at) {
      console.warn(
        '[SimpleNewsApiService] Skipping article with missing required fields',
      );
      return;
    }

    const existingArticle = await this.articleRepository.findOne({
      where: { originalUrl: apiArticle.url },
    });

    if (existingArticle) {
      console.log(
        `[SimpleNewsApiService] Article already exists: ${apiArticle.title}`,
      );
      return;
    }

    // Transform API article to our Article entity
    const article = new Article();
    article.title = this.truncateString(apiArticle.title, 500);
    article.content = this.truncateString(apiArticle.snippet, 2000);
    article.author = null; // TheNewsAPI doesn't provide author
    article.source = this.truncateString(apiArticle.source, 200);
    article.originalUrl = this.truncateString(apiArticle.url, 1000);
    article.publishedAt = new Date(apiArticle.published_at);

    // Map categories based on API categories and our available categories
    article.categories = this.mapCategories(apiArticle, availableCategories);

    // Save the article
    await this.articleRepository.save(article);
    console.log(`[SimpleNewsApiService] Stored article: ${article.title}`);
  }

  private mapCategories(
    apiArticle: TheNewsApiArticle,
    availableCategories: Category[],
  ): Category[] {
    const mappedCategories: Category[] = [];

    // Create a mapping of API categories to our database categories
    const categoryMapping: Record<string, string> = {
      general: 'General',
      tech: 'Technology',
      technology: 'Technology',
      business: 'Business',
      sports: 'Sports',
      health: 'Health',
      entertainment: 'Entertainment',
      science: 'Science',
      politics: 'Politics',
      world: 'World',
      environment: 'Environment',
    };

    // Try to map each API category to our categories
    for (const apiCategory of apiArticle.categories || []) {
      const normalizedApiCategory = apiCategory.toLowerCase();
      const ourCategoryName: string | undefined =
        categoryMapping[normalizedApiCategory];

      if (ourCategoryName) {
        const foundCategory = availableCategories.find(
          (cat) => cat.name === ourCategoryName,
        );
        if (foundCategory && !mappedCategories.includes(foundCategory)) {
          mappedCategories.push(foundCategory);
        }
      }
    }

    // If no categories were mapped, use General as fallback
    if (mappedCategories.length === 0) {
      const generalCategory = availableCategories.find(
        (cat) => cat.name === 'General',
      );
      if (generalCategory) {
        mappedCategories.push(generalCategory);
      }
    }

    return mappedCategories;
  }

  private truncateString(
    value: string | null | undefined,
    maxLength: number,
  ): string | null {
    if (!value) return null;
    return value.length > maxLength
      ? value.substring(0, maxLength - 3) + '...'
      : value;
  }
}
