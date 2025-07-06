import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReadingHistoryDto {
  @ApiProperty({
    description: 'ID of the article being read',
    example: 123,
  })
  @IsNumber()
  articleId: number;
}
