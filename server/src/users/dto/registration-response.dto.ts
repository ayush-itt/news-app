import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponse {
  @ApiProperty({
    description: 'Registration success message',
    example: 'Registration successful',
  })
  message: string;
}
