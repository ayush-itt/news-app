import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export const Auth = () => {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
};
