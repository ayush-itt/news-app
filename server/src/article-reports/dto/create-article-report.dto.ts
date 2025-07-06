import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICreateArticleReport } from '../interfaces';

export class CreateArticleReportDto implements ICreateArticleReport {
  @ApiProperty({
    description:
      'Custom reason for reporting the article. Users can provide any explanation for why they are reporting this article.',
    example: 'This article contains misleading information about the topic',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
