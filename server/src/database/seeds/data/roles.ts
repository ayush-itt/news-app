import { RoleEnum } from '@/common/enums/roles.enum';

export const rolesToAdd = [
  {
    id: 1,
    name: RoleEnum.ADMIN,
    description: 'Admin user',
  },
  {
    id: 2,
    name: RoleEnum.USER,
    description: 'Regular user',
  },
];
