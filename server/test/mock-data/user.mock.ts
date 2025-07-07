import { User } from '../../src/database/entities/user.entity';
import { Role } from '../../src/database/entities/role.entity';

export const mockUserRole: Partial<Role> = {
  id: 1,
  name: 'USER',
  description: 'Regular user role',
  createdAt: new Date('2024-01-01'),
};

export const mockAdminRole: Partial<Role> = {
  id: 2,
  name: 'ADMIN',
  description: 'Administrator role',
  createdAt: new Date('2024-01-01'),
};

export const mockUser: Partial<User> = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedPassword123',
  isActive: true,
  roleId: 1,
  role: mockUserRole as Role,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdminUser: Partial<User> = {
  id: 2,
  email: 'admin@example.com',
  username: 'adminuser',
  password: 'hashedAdminPassword123',
  isActive: true,
  roleId: 2,
  role: mockAdminRole as Role,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Export mockAdmin for backward compatibility
export const mockAdmin = mockAdminUser;

export const mockUsers: Partial<User>[] = [
  mockUser,
  mockAdminUser,
  {
    id: 3,
    email: 'user2@example.com',
    username: 'janesmith',
    password: 'hashedPassword456',
    isActive: true,
    roleId: 1,
    role: mockUserRole as Role,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];
