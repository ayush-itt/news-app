import { Bookmark } from '@/database/entities/bookmark.entity';

export const bookmarksData: Partial<Bookmark>[] = [
  {
    userId: 2,
    articleId: 2, // Second article
  },
  {
    userId: 2,
    articleId: 4, // Fourth article
  },
  {
    userId: 2,
    articleId: 6, // Sixth article
  },
];
