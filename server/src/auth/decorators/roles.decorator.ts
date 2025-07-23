import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoleEnum } from '@/common/enums/roles.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { APP } from '@/common/constants';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: RoleEnum[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RoleGuard),
    ApiBearerAuth(APP.SWAGGER_ACCESS_TOKEN),
  );
};
