import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({
    description: 'Authentication success message',
    example: 'Login successful',
  })
  message: string;
}
