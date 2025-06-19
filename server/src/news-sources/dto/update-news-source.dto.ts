import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNewsSourceDto {
  @ApiPropertyOptional({
    description: 'News source name',
    example: 'NewsAPI',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Environment variable name for API key',
    example: 'NEWSAPI_KEY',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'API key environment variable name must not exceed 100 characters',
  })
  api_key_env?: string;
}
