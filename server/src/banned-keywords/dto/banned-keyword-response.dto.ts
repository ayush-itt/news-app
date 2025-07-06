import { ApiProperty } from '@nestjs/swagger';

export class BannedKeywordResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the banned keyword',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'The banned keyword or phrase',
    example: 'inappropriate-word',
  })
  keyword: string;

  @ApiProperty({
    description: 'Description explaining why this keyword is banned',
    example: 'This keyword is associated with spam content',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Whether the keyword is currently active for filtering',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the keyword matching is case sensitive',
    example: false,
  })
  isCaseSensitive: boolean;

  @ApiProperty({
    description: 'Whether the keyword is treated as a regular expression',
    example: false,
  })
  isRegex: boolean;

  @ApiProperty({
    description: 'When the banned keyword was created',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the banned keyword was last updated',
    example: '2024-01-15T14:45:00Z',
  })
  updatedAt: Date;
}

export class BannedKeywordListResponseDto {
  @ApiProperty({
    description: 'List of banned keywords',
    type: [BannedKeywordResponseDto],
  })
  keywords: BannedKeywordResponseDto[];

  @ApiProperty({
    description: 'Total number of banned keywords',
    example: 25,
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
    example: 3,
  })
  totalPages: number;
}
