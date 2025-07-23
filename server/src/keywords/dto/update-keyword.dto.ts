import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKeywordDto {
  @ApiPropertyOptional({
    description: 'The keyword to track',
    example: 'technology',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Keyword must be at least 2 characters long' })
  @MaxLength(100, { message: 'Keyword must not exceed 100 characters' })
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Whether the keyword is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
