import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IBannedKeywordCreation } from '../interfaces';

export class CreateBannedKeywordDto implements IBannedKeywordCreation {
  @ApiProperty({
    description: 'The keyword or phrase to ban from articles',
    example: 'inappropriate-word',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  keyword: string;

  @ApiProperty({
    description: 'Optional description explaining why this keyword is banned',
    example: 'This keyword is associated with spam content',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Whether the keyword matching should be case sensitive',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCaseSensitive?: boolean;

  @ApiProperty({
    description:
      'Whether the keyword should be treated as a regular expression',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRegex?: boolean;
}
