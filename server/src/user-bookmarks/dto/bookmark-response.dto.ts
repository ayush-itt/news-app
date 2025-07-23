import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../../database/entities/article.entity';
import { Bookmark } from '../../database/entities/bookmark.entity';

export class BookmarkResponseDto {
  @ApiProperty({ description: 'Bookmark ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;

  @ApiProperty({ description: 'Article details', type: () => Article })
  article: Article;

  @ApiProperty({ description: 'Bookmark creation date' })
  createdAt: Date;

  static fromEntity(bookmark: Bookmark): BookmarkResponseDto {
    return {
      id: bookmark.id,
      userId: bookmark.userId,
      articleId: bookmark.articleId,
      article: bookmark.article,
      createdAt: bookmark.createdAt,
    };
  }

  static fromEntities(bookmarks: Bookmark[]): BookmarkResponseDto[] {
    return bookmarks.map((bookmark) => this.fromEntity(bookmark));
  }
}
