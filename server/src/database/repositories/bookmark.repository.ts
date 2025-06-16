import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Bookmark } from '../entities/bookmark.entity';

@Injectable()
export class BookmarkRepository extends Repository<Bookmark> {
  constructor(private dataSource: DataSource) {
    super(Bookmark, dataSource.createEntityManager());
  }

  async findByUserAndArticle(
    userId: number,
    articleId: number,
  ): Promise<Bookmark | null> {
    return await this.findOne({
      where: { userId, articleId },
    });
  }

  async createBookmark(userId: number, articleId: number): Promise<Bookmark> {
    const bookmark = this.create({
      userId,
      articleId,
    });
    return await this.save(bookmark);
  }

  async removeBookmark(userId: number, articleId: number): Promise<boolean> {
    const result = await this.delete({ userId, articleId });
    return result.affected > 0;
  }

  async findUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await this.find({
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
}
