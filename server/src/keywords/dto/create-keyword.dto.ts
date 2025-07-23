import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKeywordDto {
  @ApiProperty({
    description: 'Category ID for the keyword',
    example: 1,
  })
  @IsInt({ message: 'Category ID must be an integer' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: number;

  @ApiProperty({
    description: 'The keyword to track',
    example: 'technology',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Keyword is required' })
  @MinLength(2, { message: 'Keyword must be at least 2 characters long' })
  @MaxLength(100, { message: 'Keyword must not exceed 100 characters' })
  keyword: string;

  @ApiPropertyOptional({
    description: 'Whether the keyword is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
