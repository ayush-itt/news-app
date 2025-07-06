import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IReportsQuery } from '../interfaces';

export class GetReportsQueryDto implements IReportsQuery {
  @ApiProperty({
    description: 'Page number for pagination (starting from 1)',
    example: 1,
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page (maximum 100)',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description:
      'Filter reports by status. "pending" shows reports for active articles, "resolved" shows reports for hidden articles.',
    enum: ['all', 'pending', 'resolved'],
    example: 'all',
    required: false,
    default: 'all',
    examples: ['all', 'pending', 'resolved'],
  })
  @IsOptional()
  @IsString()
  @IsEnum(['all', 'pending', 'resolved'], {
    message: 'Status must be one of: all, pending, resolved',
  })
  status?: 'all' | 'pending' | 'resolved' = 'all';
}
