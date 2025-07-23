import { ApiProperty } from '@nestjs/swagger';
import { ReactionTypeEnum } from '../../common/enums/reaction-type.enum';
import { Article } from '../../database/entities/article.entity';
import { UserReaction } from '../../database/entities/user-reaction.entity';

export class ReactionResponseDto {
  @ApiProperty({ description: 'Reaction ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;

  @ApiProperty({
    description: 'Reaction type',
    enum: ReactionTypeEnum,
  })
  reactionType: ReactionTypeEnum;

  @ApiProperty({ description: 'Article details', type: () => Article })
  article: Article;

  @ApiProperty({ description: 'Reaction creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Reaction update date' })
  updatedAt: Date;

  static fromEntity(reaction: UserReaction): ReactionResponseDto {
    return {
      id: reaction.id,
      userId: reaction.userId,
      articleId: reaction.articleId,
      reactionType: reaction.reactionType,
      article: reaction.article,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    };
  }

  static fromEntities(reactions: UserReaction[]): ReactionResponseDto[] {
    return reactions.map((reaction) => this.fromEntity(reaction));
  }
}
