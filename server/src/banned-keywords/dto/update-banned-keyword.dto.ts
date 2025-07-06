import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IBannedKeywordUpdate } from '../interfaces';

export class UpdateBannedKeywordDto implements IBannedKeywordUpdate {
  @ApiProperty({
    description: 'The keyword or phrase to ban from articles',
    example: 'inappropriate-word',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  keyword?: string;

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
    description:
      'Whether the keyword is active and should be used for filtering',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether the keyword matching should be case sensitive',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCaseSensitive?: boolean;

  @ApiProperty({
    description:
      'Whether the keyword should be treated as a regular expression',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRegex?: boolean;
}
