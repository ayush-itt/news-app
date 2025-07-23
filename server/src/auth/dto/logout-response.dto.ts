import { ApiProperty } from '@nestjs/swagger';
import { ILogoutResponse } from '../interfaces';

export class LogoutResponseDto implements ILogoutResponse {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Logout successful',
  })
  message: string;
}
