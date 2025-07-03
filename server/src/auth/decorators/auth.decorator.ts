import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { APP } from '@/common/constants/app.constants';

export const Auth = () => {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(APP.SWAGGER_ACCESS_TOKEN),
  );
};
