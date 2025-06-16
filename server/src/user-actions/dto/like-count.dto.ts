import { ApiProperty } from '@nestjs/swagger';

export class LikeCountDto {
  @ApiProperty({ description: 'Number of likes for the article' })
  count: number;

  @ApiProperty({ description: 'Article ID' })
  articleId: number;
}
