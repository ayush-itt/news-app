import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponse {
  @ApiProperty({
    description: 'Success message for user deletion operation',
    example: 'User deleted successfully',
  })
  message: string;
}
