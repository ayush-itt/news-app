import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../../database/entities/article.entity';

export class BookmarkResponseDto {
  @ApiProperty({ description: 'Bookmark ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;

  @ApiProperty({ description: 'Article details', type: () => Article })
  article: Article;

  @ApiProperty({ description: 'Action creation date' })
  createdAt: Date;
}
