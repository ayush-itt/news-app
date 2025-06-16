import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponse {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Logout successful',
  })
  message: string;
}
