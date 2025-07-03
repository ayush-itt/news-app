import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    description: 'Authentication success message',
    example: 'Login successful',
  })
  message: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      role: 'USER',
    },
  })
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}
