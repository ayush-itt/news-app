import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '../../common/enums/reaction-type.enum';
import { Article } from '../../database/entities/article.entity';

export class ReactionResponseDto {
  @ApiProperty({ description: 'Reaction ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;

  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionType,
  })
  reactionType: ReactionType;

  @ApiProperty({ description: 'Article details', type: () => Article })
  article: Article;

  @ApiProperty({ description: 'Reaction creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Reaction update date' })
  updatedAt: Date;
}
