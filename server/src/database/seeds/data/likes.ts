import { Like } from '@/database/entities/like.entity';

export const likesData: Partial<Like>[] = [
  {
    userId: 2,
    articleId: 1, // First article
  },
  {
    userId: 2,
    articleId: 3, // Third article
  },
  {
    userId: 2,
    articleId: 5, // Fifth article
  },
];
