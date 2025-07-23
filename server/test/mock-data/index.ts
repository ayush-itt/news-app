// User and Role mocks
export * from './user.mock';

// Article and Category mocks
export * from './article.mock';

// Interaction mocks (bookmarks, reactions)
export * from './interactions.mock';

// DTO mocks
export * from './dto.mock';

// Common test utilities
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockJwtPayload = {
  sub: 1,
  username: 'testuser',
  email: 'test@example.com',
  roleId: 1,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

export const mockRequest = {
  user: {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    roleId: 1,
  },
  headers: {
    authorization: 'Bearer mock-jwt-token',
  },
};

export const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
};

export const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

export const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
  getOne: jest.fn(),
  getCount: jest.fn(),
  getRawMany: jest.fn(),
  getRawOne: jest.fn(),
};

export const createMockRepository = () => ({
  ...mockRepository,
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
});

export const resetMocks = () => {
  Object.keys(mockRepository).forEach((key) => {
    if (typeof mockRepository[key] === 'function') {
      mockRepository[key].mockClear();
    }
  });

  Object.keys(mockQueryBuilder).forEach((key) => {
    if (typeof mockQueryBuilder[key] === 'function') {
      mockQueryBuilder[key].mockClear();
    }
  });

  mockResponse.status.mockClear();
  mockResponse.json.mockClear();
  mockResponse.send.mockClear();
};
