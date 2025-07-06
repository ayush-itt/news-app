import { UserReaction } from '../../entities/user-reaction.entity';
import { ReactionTypeEnum } from '@/common/enums/reaction-type.enum';

// Type for seeding data - based on UserReaction entity
export type UserReactionSeedData = Omit<
  Partial<UserReaction>,
  'id' | 'user' | 'article' | 'createdAt' | 'updatedAt'
> & {
  userId: number;
  articleId: number;
  reactionType: ReactionTypeEnum;
};

export const userReactionsData: UserReactionSeedData[] = [
  {
    userId: 2,
    articleId: 1, // AI Revolution article
    reactionType: ReactionTypeEnum.LIKE,
  },
  {
    userId: 2,
    articleId: 2, // Climate Change article
    reactionType: ReactionTypeEnum.LIKE,
  },
  {
    userId: 2,
    articleId: 4, // Olympic Champion article
    reactionType: ReactionTypeEnum.LIKE,
  },
  {
    userId: 2,
    articleId: 6, // Hollywood Blockbuster article
    reactionType: ReactionTypeEnum.DISLIKE,
  },
  {
    userId: 2,
    articleId: 8, // Mental Health Initiative article
    reactionType: ReactionTypeEnum.LIKE,
  },
];
