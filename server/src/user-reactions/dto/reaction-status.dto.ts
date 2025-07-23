import { ApiProperty } from '@nestjs/swagger';

export class ReactionStatusDto {
  @ApiProperty({ description: 'Status message' })
  message: string;

  @ApiProperty({ description: 'Success status' })
  success: boolean;
}
