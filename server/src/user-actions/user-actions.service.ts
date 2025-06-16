import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { LikeRepository } from '../database/repositories/like.repository';
import { BookmarkRepository } from '../database/repositories/bookmark.repository';
import { ArticleRepository } from '../database/repositories/article.repository';
import { Like } from '../database/entities/like.entity';
import { Bookmark } from '../database/entities/bookmark.entity';

@Injectable()
export class UserActionsService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly bookmarkRepository: BookmarkRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  // Like Operations
  async likeArticle(userId: number, articleId: number): Promise<Like> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if already liked
    const existingLike = await this.likeRepository.findByUserAndArticle(
      userId,
      article.id,
    );
    if (existingLike) {
      throw new ConflictException('Article already liked by user');
    }

    return await this.likeRepository.createLike(userId, article.id);
  }

  async unlikeArticle(userId: number, articleId: number): Promise<void> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const removed = await this.likeRepository.removeLike(userId, article.id);
    if (!removed) {
      throw new NotFoundException('Like not found');
    }
  }

  async getUserLikes(userId: number): Promise<Like[]> {
    return await this.likeRepository.findUserLikes(userId);
  }

  async isArticleLikedByUser(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      return false;
    }
    return await this.likeRepository.isLikedByUser(userId, article.id);
  }

  // Bookmark Operations
  async bookmarkArticle(userId: number, articleId: number): Promise<Bookmark> {
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

  // Statistics
  async getArticleLikeCount(articleId: number): Promise<number> {
    const article =
      await this.articleRepository.findByIdWithCategories(articleId);
    if (!article) {
      return 0;
    }
    return await this.likeRepository.countLikesForArticle(article.id);
  }
}
