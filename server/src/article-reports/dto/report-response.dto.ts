import { ApiProperty } from '@nestjs/swagger';

export class ArticleReportResponseDto {
  @ApiProperty({
    description: 'Report ID',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the reported article',
    example: 456,
  })
  articleId: number;

  @ApiProperty({
    description: 'ID of the user who reported',
    example: 789,
  })
  userId: number;

  @ApiProperty({
    description:
      'Custom reason provided by the user for reporting this article',
    example: 'This article contains misleading information about the topic',
    nullable: true,
  })
  reason?: string;

  @ApiProperty({
    description: 'When the report was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}

export class ReportCountResponseDto {
  @ApiProperty({
    description: 'Article ID',
    example: 456,
  })
  articleId: number;

  @ApiProperty({
    description: 'Total number of reports for this article',
    example: 3,
  })
  reportCount: number;
}

export class ReportSummaryDto {
  @ApiProperty({
    description: 'Total number of reports',
    example: 50,
  })
  totalReports: number;

  @ApiProperty({
    description: 'Number of pending reports',
    example: 25,
  })
  pendingReports: number;

  @ApiProperty({
    description: 'Number of resolved reports',
    example: 25,
  })
  resolvedReports: number;
}

export class PaginatedReportsResponseDto {
  @ApiProperty({
    description: 'Array of reports',
    type: [ArticleReportResponseDto],
  })
  reports: ArticleReportResponseDto[];

  @ApiProperty({
    description: 'Total number of reports',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Summary statistics',
    type: ReportSummaryDto,
  })
  summary: ReportSummaryDto;
}
