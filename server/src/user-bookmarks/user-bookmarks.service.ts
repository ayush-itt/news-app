import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { BookmarkRepository } from '../database/repositories/bookmark.repository';
import { ArticleRepository } from '../database/repositories/article.repository';
import { Bookmark } from '../database/entities/bookmark.entity';

@Injectable()
export class UserBookmarksService {
  constructor(
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async bookmarkArticle(userId: number, articleId: number): Promise<Bookmark> {
    // Verify article exists
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if already bookmarked
    const existingBookmark = await this.bookmarkRepository.findByUserAndArticle(
      userId,
      article.id,
    );
    if (existingBookmark) {
      throw new ConflictException('Article already bookmarked by user');
    }

    return await this.bookmarkRepository.createBookmark(userId, article.id);
  }

  async removeBookmark(userId: number, articleId: number): Promise<void> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const removed = await this.bookmarkRepository.removeBookmark(
      userId,
      article.id,
    );
    if (!removed) {
      throw new NotFoundException('Bookmark not found');
    }
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await this.bookmarkRepository.findUserBookmarks(userId);
  }

  async isArticleBookmarkedByUser(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      return false;
    }
    return await this.bookmarkRepository.isBookmarkedByUser(userId, article.id);
  }

  async getBookmarkCountForArticle(articleId: number): Promise<number> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      return 0;
    }
    return await this.bookmarkRepository.countBookmarksForArticle(article.id);
  }
}
