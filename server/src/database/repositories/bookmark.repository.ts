import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';

@Injectable()
export class BookmarkRepository {
  constructor(
    @InjectRepository(Bookmark)
    private readonly repository: Repository<Bookmark>,
  ) {}

  async findByUserAndArticle(
    userId: number,
    articleId: number,
  ): Promise<Bookmark | null> {
    return await this.repository.findOne({
      where: { userId, articleId },
      relations: ['article'],
    });
  }

  async createBookmark(userId: number, articleId: number): Promise<Bookmark> {
    const bookmark = this.repository.create({
      userId,
      articleId,
    });
    return await this.repository.save(bookmark);
  }

  async removeBookmark(userId: number, articleId: number): Promise<boolean> {
    const result = await this.repository.delete({ userId, articleId });
    return result.affected > 0;
  }

  async findUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['article', 'article.categories'],
      order: { createdAt: 'DESC' },
    });
  }

  async isBookmarkedByUser(
    userId: number,
    articleId: number,
  ): Promise<boolean> {
    const bookmark = await this.findByUserAndArticle(userId, articleId);
    return !!bookmark;
  }

  async countBookmarksForArticle(articleId: number): Promise<number> {
    return await this.repository.count({
      where: { articleId },
    });
  }
}
