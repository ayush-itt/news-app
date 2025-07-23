import { Article } from '../../src/database/entities/article.entity';
import { Category } from '../../src/database/entities/category.entity';

export const mockCategory: Partial<Category> = {
  id: 1,
  name: 'Technology',
  slug: 'technology',
  description: 'Technology news and articles',
  isActive: true,
  createdAt: new Date('2024-01-01'),
};

export const mockSportsCategory: Partial<Category> = {
  id: 2,
  name: 'Sports',
  slug: 'sports',
  description: 'Sports news and articles',
  isActive: true,
  createdAt: new Date('2024-01-01'),
};

export const mockCategories: Partial<Category>[] = [
  mockCategory,
  mockSportsCategory,
  {
    id: 3,
    name: 'Politics',
    slug: 'politics',
    description: 'Political news and articles',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 4,
    name: 'Business',
    slug: 'business',
    description: 'Business news and articles',
    isActive: false,
    createdAt: new Date('2024-01-01'),
  },
];

export const mockArticle: Partial<Article> = {
  id: 1,
  title: 'Breaking: New Technology Breakthrough',
  content:
    'This is a comprehensive article about the latest technology breakthrough...',
  author: 'John Tech',
  source: 'TechNews',
  originalUrl: 'https://example.com/article1',
  publishedAt: new Date('2024-01-01T10:00:00Z'),
  scrapedAt: new Date('2024-01-01T11:00:00Z'),
  createdAt: new Date('2024-01-01T11:00:00Z'),
  processedForNotifications: false,
  isActive: true,
  categories: [mockCategory as Category],
};

export const mockArticles: Partial<Article>[] = [
  mockArticle,
  {
    id: 2,
    title: 'Sports Update: Championship Finals',
    content: 'The championship finals are approaching with exciting matches...',
    author: 'Sports Reporter',
    source: 'SportsNet',
    originalUrl: 'https://example.com/article2',
    publishedAt: new Date('2024-01-02T14:00:00Z'),
    scrapedAt: new Date('2024-01-02T15:00:00Z'),
    createdAt: new Date('2024-01-02T15:00:00Z'),
    processedForNotifications: true,
    isActive: true,
    categories: [mockSportsCategory as Category],
  },
  {
    id: 3,
    title: 'Inactive Article',
    content: 'This article has been deactivated...',
    author: 'Test Author',
    source: 'TestSource',
    originalUrl: 'https://example.com/article3',
    publishedAt: new Date('2024-01-03T09:00:00Z'),
    scrapedAt: new Date('2024-01-03T10:00:00Z'),
    createdAt: new Date('2024-01-03T10:00:00Z'),
    processedForNotifications: false,
    isActive: false,
    categories: [mockCategory as Category],
  },
];
