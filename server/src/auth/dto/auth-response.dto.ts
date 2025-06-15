import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({
    description: 'Authentication success message',
    example: 'Login successful',
  })
  message: string;
}

export class RegistrationResponse {
  @ApiProperty({
    description: 'Registration success message',
    example: 'Registration successful',
  })
  message: string;
}

export class LogoutResponse {
  @ApiProperty({
    description: 'Logout success message',
    example: 'Logout successful',
  })
  message: string;
}
