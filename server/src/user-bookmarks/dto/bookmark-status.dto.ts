import { ApiProperty } from '@nestjs/swagger';

export class BookmarkStatusDto {
  @ApiProperty({ description: 'Status message' })
  message: string;

  @ApiProperty({ description: 'Success status' })
  success: boolean;
}
