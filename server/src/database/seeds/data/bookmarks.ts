import { Bookmark } from '@/database/entities/bookmark.entity';

// Type for seeding data - based on Bookmark entity
export type BookmarkSeedData = Omit<
  Partial<Bookmark>,
  'id' | 'user' | 'article' | 'createdAt'
> & {
  userId: number;
  articleId: number;
};

export const bookmarksData: BookmarkSeedData[] = [
  // Admin user bookmarks (userId: 1)
  {
    userId: 1,
    articleId: 1, // AI Revolution article
  },
  {
    userId: 1,
    articleId: 5, // Quantum Computing article
  },
  {
    userId: 1,
    articleId: 7, // Space Mission article
  },
  {
    userId: 1,
    articleId: 10, // Electric Vehicle Battery article
  },

  // User 2 bookmarks - more varied interests
  {
    userId: 2,
    articleId: 2, // Climate Change article
  },
  {
    userId: 2,
    articleId: 4, // Olympic Champion article
  },
  {
    userId: 2,
    articleId: 8, // Mental Health Initiative article
  },
  {
    userId: 2,
    articleId: 16, // Vaccine Development article
  },

  // User 3 bookmarks - tech and science focus
  {
    userId: 3,
    articleId: 1, // AI Revolution article - popular
  },
  {
    userId: 3,
    articleId: 5, // Quantum Computing article
  },
  {
    userId: 3,
    articleId: 13, // Archaeological Discovery article
  },
  {
    userId: 3,
    articleId: 18, // AI Educational Platform article
  },

  // User 4 bookmarks - business and health focus
  {
    userId: 4,
    articleId: 3, // Stock Market article
  },
  {
    userId: 4,
    articleId: 9, // Trade Agreement article
  },
  {
    userId: 4,
    articleId: 16, // Vaccine Development article
  },
  {
    userId: 4,
    articleId: 20, // Gene Therapy article
  },

  // User 5 bookmarks - entertainment and environment
  {
    userId: 5,
    articleId: 6, // Hollywood Blockbuster article
  },
  {
    userId: 5,
    articleId: 11, // Music Festival article
  },
  {
    userId: 5,
    articleId: 14, // Renewable Energy article
  },
  {
    userId: 5,
    articleId: 17, // Documentary Film article
  },
  {
    userId: 5,
    articleId: 19, // Food Security Summit article
  },
];
