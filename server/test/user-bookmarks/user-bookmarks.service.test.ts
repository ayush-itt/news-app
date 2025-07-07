import { Test, TestingModule } from '@nestjs/testing';
import { UserBookmarksService } from '@/user-bookmarks/user-bookmarks.service';
import { BookmarkRepository } from '@/database/repositories/bookmark.repository';
import { ArticleRepository } from '@/database/repositories/article.repository';
import {
  mockUserBookmarks,
  mockUserBookmark,
  mockUser,
  mockArticle,
  resetMocks,
} from '../mock-data';

describe('UserBookmarksService', () => {
  let service: UserBookmarksService;
  let bookmarkRepository: BookmarkRepository;
  let articleRepository: ArticleRepository;

  const mockBookmarkRepository = {
    findByUserAndArticle: jest.fn(),
    createBookmark: jest.fn(),
    removeBookmark: jest.fn(),
    findUserBookmarks: jest.fn(),
    isBookmarkedByUser: jest.fn(),
    countBookmarksForArticle: jest.fn(),
  };

  const mockArticleRepository = {
    findByIdWithCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBookmarksService,
        {
          provide: BookmarkRepository,
          useValue: mockBookmarkRepository,
        },
        {
          provide: ArticleRepository,
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<UserBookmarksService>(UserBookmarksService);
    bookmarkRepository = module.get<BookmarkRepository>(BookmarkRepository);
    articleRepository = module.get<ArticleRepository>(ArticleRepository);
  });

  afterEach(() => {
    resetMocks();
    jest.clearAllMocks();
  });

  describe('bookmarkArticle', () => {
    it('should bookmark an article successfully', async () => {
      const newBookmark = { ...mockUserBookmark, id: 4, articleId: 3 };

      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.findByUserAndArticle.mockResolvedValue(null);
      mockBookmarkRepository.createBookmark.mockResolvedValue(newBookmark);

      const result = await service.bookmarkArticle(mockUser.id, 3);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(3);
      expect(bookmarkRepository.findByUserAndArticle).toHaveBeenCalledWith(
        mockUser.id,
        mockArticle.id,
      );
      expect(bookmarkRepository.createBookmark).toHaveBeenCalledWith(
        mockUser.id,
        mockArticle.id,
      );
      expect(result).toEqual(newBookmark);
    });

    it('should throw error when article not found', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(service.bookmarkArticle(mockUser.id, 999)).rejects.toThrow(
        'Article not found',
      );
    });

    it('should throw error when article already bookmarked', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.findByUserAndArticle.mockResolvedValue(
        mockUserBookmark,
      );

      await expect(service.bookmarkArticle(mockUser.id, 1)).rejects.toThrow(
        'Article already bookmarked by user',
      );
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark successfully', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.removeBookmark.mockResolvedValue(true);

      await service.removeBookmark(mockUser.id, 1);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(1);
      expect(bookmarkRepository.removeBookmark).toHaveBeenCalledWith(
        mockUser.id,
        mockArticle.id,
      );
    });

    it('should throw error when article not found', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      await expect(service.removeBookmark(mockUser.id, 999)).rejects.toThrow(
        'Article not found',
      );
    });

    it('should throw error when bookmark not found', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.removeBookmark.mockResolvedValue(false);

      await expect(service.removeBookmark(mockUser.id, 1)).rejects.toThrow(
        'Bookmark not found',
      );
    });
  });

  describe('getUserBookmarks', () => {
    it('should return user bookmarks', async () => {
      const userBookmarks = mockUserBookmarks.filter(
        (b) => b.userId === mockUser.id,
      );
      mockBookmarkRepository.findUserBookmarks.mockResolvedValue(userBookmarks);

      const result = await service.getUserBookmarks(mockUser.id);

      expect(bookmarkRepository.findUserBookmarks).toHaveBeenCalledWith(
        mockUser.id,
      );
      expect(result).toEqual(userBookmarks);
    });

    it('should return empty array when user has no bookmarks', async () => {
      mockBookmarkRepository.findUserBookmarks.mockResolvedValue([]);

      const result = await service.getUserBookmarks(999);

      expect(bookmarkRepository.findUserBookmarks).toHaveBeenCalledWith(999);
      expect(result).toEqual([]);
    });
  });

  describe('isArticleBookmarkedByUser', () => {
    it('should return true when article is bookmarked', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.isBookmarkedByUser.mockResolvedValue(true);

      const result = await service.isArticleBookmarkedByUser(mockUser.id, 1);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(1);
      expect(bookmarkRepository.isBookmarkedByUser).toHaveBeenCalledWith(
        mockUser.id,
        mockArticle.id,
      );
      expect(result).toBe(true);
    });

    it('should return false when article is not found', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      const result = await service.isArticleBookmarkedByUser(mockUser.id, 999);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        999,
      );
      expect(result).toBe(false);
    });

    it('should return false when article is not bookmarked', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.isBookmarkedByUser.mockResolvedValue(false);

      const result = await service.isArticleBookmarkedByUser(mockUser.id, 2);

      expect(bookmarkRepository.isBookmarkedByUser).toHaveBeenCalledWith(
        mockUser.id,
        mockArticle.id,
      );
      expect(result).toBe(false);
    });
  });

  describe('getBookmarkCountForArticle', () => {
    it('should return bookmark count for article', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(
        mockArticle,
      );
      mockBookmarkRepository.countBookmarksForArticle.mockResolvedValue(5);

      const result = await service.getBookmarkCountForArticle(1);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(1);
      expect(bookmarkRepository.countBookmarksForArticle).toHaveBeenCalledWith(
        mockArticle.id,
      );
      expect(result).toBe(5);
    });

    it('should return 0 when article not found', async () => {
      mockArticleRepository.findByIdWithCategories.mockResolvedValue(null);

      const result = await service.getBookmarkCountForArticle(999);

      expect(articleRepository.findByIdWithCategories).toHaveBeenCalledWith(
        999,
      );
      expect(result).toBe(0);
    });
  });
});
