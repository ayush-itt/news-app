import { Bookmark } from '../../src/database/entities/bookmark.entity';
import { UserReaction } from '../../src/database/entities/user-reaction.entity';
import { Category } from '../../src/database/entities/category.entity';
import { ReactionTypeEnum } from '../../src/common/enums/reaction-type.enum';
import { mockUser, mockAdminUser } from './user.mock';
import { mockArticle, mockArticles } from './article.mock';
import { User } from '../../src/database/entities/user.entity';
import { Article } from '../../src/database/entities/article.entity';

export const mockCategory: Partial<Category> = {
  id: 1,
  name: 'Technology',
  slug: 'technology',
  description: 'Technology related articles',
  isActive: true,
  createdAt: new Date('2024-01-01'),
};

export const mockUserBookmark: Partial<Bookmark> = {
  id: 1,
  userId: 1,
  articleId: 1,
  user: mockUser as User,
  article: mockArticle as Article,
  createdAt: new Date('2024-01-01'),
};

export const mockUserBookmarks: Partial<Bookmark>[] = [
  mockUserBookmark,
  {
    id: 2,
    userId: 1,
    articleId: 2,
    user: mockUser as User,
    article: mockArticles[1] as Article,
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 3,
    userId: 2,
    articleId: 1,
    user: mockAdminUser as User,
    article: mockArticle as Article,
    createdAt: new Date('2024-01-01'),
  },
];

export const mockUserReaction: Partial<UserReaction> = {
  id: 1,
  userId: 1,
  articleId: 1,
  reactionType: ReactionTypeEnum.LIKE,
  user: mockUser as User,
  article: mockArticle as Article,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUserReactions: Partial<UserReaction>[] = [
  mockUserReaction,
  {
    id: 2,
    userId: 1,
    articleId: 2,
    reactionType: ReactionTypeEnum.DISLIKE,
    user: mockUser as User,
    article: mockArticles[1] as Article,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 3,
    userId: 2,
    articleId: 1,
    reactionType: ReactionTypeEnum.LIKE,
    user: mockAdminUser as User,
    article: mockArticle as Article,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockReactionStats = {
  likes: 2,
  dislikes: 1,
  articleId: 1,
};
