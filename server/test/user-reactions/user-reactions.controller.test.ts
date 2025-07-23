import { Test, TestingModule } from '@nestjs/testing';
import { UserReactionsController } from '@/user-reactions/user-reactions.controller';
import { UserReactionsService } from '@/user-reactions/user-reactions.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ReactionTypeEnum } from '@/common/enums/reaction-type.enum';
import {
  mockUserReactions,
  mockUserReaction,
  mockUser,
  mockReactionRequestDto,
  mockReactionStats,
  resetMocks,
} from '../mock-data';

describe('UserReactionsController', () => {
  let controller: UserReactionsController;
  let service: UserReactionsService;

  const mockUserReactionsService = {
    reactToArticle: jest.fn(),
    getUserReactions: jest.fn(),
    getUserLikedArticles: jest.fn(),
    getUserDislikedArticles: jest.fn(),
    getArticleReactionStats: jest.fn(),
    getUserReactionForArticle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReactionsController],
      providers: [
        {
          provide: UserReactionsService,
          useValue: mockUserReactionsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserReactionsController>(UserReactionsController);
    service = module.get<UserReactionsService>(UserReactionsService);
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('reactToArticle', () => {
    it('should create/update a reaction successfully', async () => {
      const newReaction = {
        ...mockUserReaction,
        reactionType: ReactionTypeEnum.LIKE,
      };
      mockUserReactionsService.reactToArticle.mockResolvedValue(newReaction);

      const result = await controller.reactToArticle(
        mockUser as any,
        1,
        mockReactionRequestDto,
      );

      expect(service.reactToArticle).toHaveBeenCalledWith(
        mockUser.id,
        1,
        mockReactionRequestDto.reaction,
      );
      expect(result).toEqual({
        id: newReaction.id,
        userId: newReaction.userId,
        articleId: newReaction.articleId,
        reactionType: newReaction.reactionType,
        createdAt: newReaction.createdAt,
        updatedAt: newReaction.updatedAt,
      });
    });

    it('should return status message when reaction is removed (toggle off)', async () => {
      mockUserReactionsService.reactToArticle.mockResolvedValue(null);

      const result = await controller.reactToArticle(
        mockUser as any,
        1,
        mockReactionRequestDto,
      );

      expect(service.reactToArticle).toHaveBeenCalledWith(
        mockUser.id,
        1,
        mockReactionRequestDto.reaction,
      );
      expect(result).toEqual({
        message: 'Reaction removed successfully',
        success: true,
      });
    });

    it('should throw error when article not found', async () => {
      mockUserReactionsService.reactToArticle.mockRejectedValue(
        new Error('Article not found'),
      );

      await expect(
        controller.reactToArticle(mockUser as any, 999, mockReactionRequestDto),
      ).rejects.toThrow('Article not found');
    });
  });

  describe('getUserReactions', () => {
    it('should return user reactions', async () => {
      const userReactions = mockUserReactions.filter(
        (r) => r.userId === mockUser.id,
      );
      mockUserReactionsService.getUserReactions.mockResolvedValue(
        userReactions,
      );

      const result = await controller.getUserReactions(mockUser as any);

      expect(service.getUserReactions).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(userReactions.length);
      expect(result[0]).toEqual({
        id: userReactions[0].id,
        userId: userReactions[0].userId,
        articleId: userReactions[0].articleId,
        reactionType: userReactions[0].reactionType,
        createdAt: userReactions[0].createdAt,
        updatedAt: userReactions[0].updatedAt,
      });
    });

    it('should return empty array when user has no reactions', async () => {
      mockUserReactionsService.getUserReactions.mockResolvedValue([]);

      const result = await controller.getUserReactions(mockUser as any);

      expect(service.getUserReactions).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  describe('getUserLikedArticles', () => {
    it('should return user liked articles', async () => {
      const likedReactions = mockUserReactions.filter(
        (r) =>
          r.userId === mockUser.id && r.reactionType === ReactionTypeEnum.LIKE,
      );
      mockUserReactionsService.getUserLikedArticles.mockResolvedValue(
        likedReactions,
      );

      const result = await controller.getUserLikedArticles(mockUser as any);

      expect(service.getUserLikedArticles).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(
        likedReactions.map((reaction) => ({
          id: reaction.id,
          userId: reaction.userId,
          articleId: reaction.articleId,
          reactionType: reaction.reactionType,
          createdAt: reaction.createdAt,
          updatedAt: reaction.updatedAt,
        })),
      );
    });
  });

  describe('getUserDislikedArticles', () => {
    it('should return user disliked articles', async () => {
      const dislikedReactions = mockUserReactions.filter(
        (r) =>
          r.userId === mockUser.id &&
          r.reactionType === ReactionTypeEnum.DISLIKE,
      );
      mockUserReactionsService.getUserDislikedArticles.mockResolvedValue(
        dislikedReactions,
      );

      const result = await controller.getUserDislikedArticles(mockUser as any);

      expect(service.getUserDislikedArticles).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(
        dislikedReactions.map((reaction) => ({
          id: reaction.id,
          userId: reaction.userId,
          articleId: reaction.articleId,
          reactionType: reaction.reactionType,
          createdAt: reaction.createdAt,
          updatedAt: reaction.updatedAt,
        })),
      );
    });
  });

  describe('getArticleReactionStats', () => {
    it('should return article reaction statistics', async () => {
      mockUserReactionsService.getArticleReactionStats.mockResolvedValue(
        mockReactionStats,
      );

      const result = await controller.getArticleReactionStats(1);

      expect(service.getArticleReactionStats).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        likes: mockReactionStats.likes,
        dislikes: mockReactionStats.dislikes,
        articleId: 1,
      });
    });

    it('should throw error when article not found', async () => {
      mockUserReactionsService.getArticleReactionStats.mockRejectedValue(
        new Error('Article not found'),
      );

      await expect(controller.getArticleReactionStats(999)).rejects.toThrow(
        'Article not found',
      );
    });
  });

  describe('getUserReactionForArticle', () => {
    it('should return user reaction for specific article', async () => {
      const reaction = mockUserReaction;
      mockUserReactionsService.getUserReactionForArticle.mockResolvedValue(
        reaction,
      );

      const result = await controller.getUserReactionForArticle(
        mockUser as any,
        1,
      );

      expect(service.getUserReactionForArticle).toHaveBeenCalledWith(
        mockUser.id,
        1,
      );
      expect(result).toEqual({
        id: reaction.id,
        userId: reaction.userId,
        articleId: reaction.articleId,
        reactionType: reaction.reactionType,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
      });
    });

    it('should return null when user has no reaction for article', async () => {
      mockUserReactionsService.getUserReactionForArticle.mockResolvedValue(
        null,
      );

      const result = await controller.getUserReactionForArticle(
        mockUser as any,
        2,
      );

      expect(service.getUserReactionForArticle).toHaveBeenCalledWith(
        mockUser.id,
        2,
      );
      expect(result).toBeNull();
    });
  });
});
