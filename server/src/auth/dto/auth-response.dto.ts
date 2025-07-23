import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authentication success message',
    example: 'Login successful',
  })
  message: string;
}
