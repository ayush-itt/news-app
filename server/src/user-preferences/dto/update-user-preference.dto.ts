import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPreferenceDto {
  @ApiProperty({
    description: 'Whether user wants to subscribe to this category',
    example: true,
    type: 'boolean',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;
}
