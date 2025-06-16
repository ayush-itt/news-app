import { ApiProperty } from '@nestjs/swagger';

export class ActionStatusDto {
  @ApiProperty({ description: 'Action status message' })
  message: string;

  @ApiProperty({ description: 'Success status' })
  success: boolean;
}
