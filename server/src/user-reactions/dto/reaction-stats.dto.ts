import { ApiProperty } from '@nestjs/swagger';

export class ReactionStatsDto {
  @ApiProperty({ description: 'Number of likes' })
  likes: number;

  @ApiProperty({ description: 'Number of dislikes' })
  dislikes: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;
}
