import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponse {
  @ApiProperty({
    description: 'Success message for user update operation',
    example: 'User updated successfully',
  })
  message: string;
}
