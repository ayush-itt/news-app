import { Test, TestingModule } from '@nestjs/testing';
import { UserBookmarksController } from '@/user-bookmarks/user-bookmarks.controller';
import { UserBookmarksService } from '@/user-bookmarks/user-bookmarks.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  mockUserBookmarks,
  mockUserBookmark,
  mockUser,
  resetMocks,
} from '../mock-data';

describe('UserBookmarksController', () => {
  let controller: UserBookmarksController;
  let service: UserBookmarksService;

  const mockUserBookmarksService = {
    bookmarkArticle: jest.fn(),
    removeBookmark: jest.fn(),
    getUserBookmarks: jest.fn(),
    isArticleBookmarkedByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBookmarksController],
      providers: [
        {
          provide: UserBookmarksService,
          useValue: mockUserBookmarksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserBookmarksController>(UserBookmarksController);
    service = module.get<UserBookmarksService>(UserBookmarksService);
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('bookmarkArticle', () => {
    it('should bookmark an article successfully', async () => {
      const newBookmark = { ...mockUserBookmark, id: 4, articleId: 3 };
      mockUserBookmarksService.bookmarkArticle.mockResolvedValue(newBookmark);

      const result = await controller.bookmarkArticle(mockUser as any, 3);

      expect(service.bookmarkArticle).toHaveBeenCalledWith(mockUser.id, 3);
      expect(result).toEqual({
        id: newBookmark.id,
        userId: newBookmark.userId,
        articleId: newBookmark.articleId,
        article: newBookmark.article,
        createdAt: newBookmark.createdAt,
      });
    });

    it('should throw error when article not found', async () => {
      mockUserBookmarksService.bookmarkArticle.mockRejectedValue(
        new Error('Article not found'),
      );

      await expect(
        controller.bookmarkArticle(mockUser as any, 999),
      ).rejects.toThrow('Article not found');
    });

    it('should throw error when article already bookmarked', async () => {
      mockUserBookmarksService.bookmarkArticle.mockRejectedValue(
        new Error('Article already bookmarked'),
      );

      await expect(
        controller.bookmarkArticle(mockUser as any, 1),
      ).rejects.toThrow('Article already bookmarked');
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark successfully', async () => {
      mockUserBookmarksService.removeBookmark.mockResolvedValue(undefined);

      const result = await controller.removeBookmark(mockUser as any, 1);

      expect(service.removeBookmark).toHaveBeenCalledWith(mockUser.id, 1);
      expect(result).toEqual({
        message: 'Bookmark removed successfully',
        success: true,
      });
    });

    it('should throw error when bookmark not found', async () => {
      mockUserBookmarksService.removeBookmark.mockRejectedValue(
        new Error('Bookmark not found'),
      );

      await expect(
        controller.removeBookmark(mockUser as any, 999),
      ).rejects.toThrow('Bookmark not found');
    });
  });

  describe('getUserBookmarks', () => {
    it('should return user bookmarks', async () => {
      const userBookmarks = mockUserBookmarks.filter(
        (b) => b.userId === mockUser.id,
      );
      mockUserBookmarksService.getUserBookmarks.mockResolvedValue(
        userBookmarks,
      );

      const result = await controller.getUserBookmarks(mockUser as any);

      expect(service.getUserBookmarks).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(userBookmarks.length);
      expect(result[0]).toEqual({
        id: userBookmarks[0].id,
        userId: userBookmarks[0].userId,
        articleId: userBookmarks[0].articleId,
        article: userBookmarks[0].article,
        createdAt: userBookmarks[0].createdAt,
      });
    });

    it('should return empty array when user has no bookmarks', async () => {
      mockUserBookmarksService.getUserBookmarks.mockResolvedValue([]);

      const result = await controller.getUserBookmarks(mockUser as any);

      expect(service.getUserBookmarks).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  describe('isArticleBookmarked', () => {
    it('should return true when article is bookmarked', async () => {
      mockUserBookmarksService.isArticleBookmarkedByUser.mockResolvedValue(
        true,
      );

      const result = await controller.isArticleBookmarked(mockUser as any, 1);

      expect(service.isArticleBookmarkedByUser).toHaveBeenCalledWith(
        mockUser.id,
        1,
      );
      expect(result).toEqual({
        isBookmarked: true,
        articleId: 1,
      });
    });

    it('should return false when article is not bookmarked', async () => {
      mockUserBookmarksService.isArticleBookmarkedByUser.mockResolvedValue(
        false,
      );

      const result = await controller.isArticleBookmarked(mockUser as any, 2);

      expect(service.isArticleBookmarkedByUser).toHaveBeenCalledWith(
        mockUser.id,
        2,
      );
      expect(result).toEqual({
        isBookmarked: false,
        articleId: 2,
      });
    });
  });
});
