import { RegisterDto } from '../../src/users/dto/register.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { CreateCategoryDto } from '../../src/categories/dto/create-category.dto';
import { CreateArticleReportDto } from '../../src/article-reports/dto/create-article-report.dto';
import { ReactionRequestDto } from '../../src/user-reactions/dto/reaction-request.dto';
import { CreateKeywordDto } from '../../src/keywords/dto/create-keyword.dto';
import { UpdateUserPreferenceDto } from '../../src/user-preferences/dto/update-user-preference.dto';
import { ReactionTypeEnum } from '../../src/common/enums/reaction-type.enum';

export const mockRegisterDto: RegisterDto = {
  email: 'newuser@example.com',
  username: 'newuser',
  password: 'password123',
};

export const mockUpdateUserDto: UpdateUserDto = {
  email: 'updated@example.com',
  username: 'updateduser',
};

export const mockCreateCategoryDto: CreateCategoryDto = {
  name: 'New Category',
  description: 'A new category for testing',
};

export const mockCreateArticleReportDto: CreateArticleReportDto = {
  reason: 'spam',
};

export const mockReactionRequestDto: ReactionRequestDto = {
  reaction: ReactionTypeEnum.LIKE,
};

export const mockCreateKeywordDto: CreateKeywordDto = {
  keyword: 'test keyword',
  categoryId: 1,
};

export const mockUpdateUserPreferenceDto: UpdateUserPreferenceDto = {
  isSubscribed: true,
};

export const mockPaginationQuery = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC' as const,
};

export const mockSearchQuery = {
  search: 'technology',
  category: 'Technology',
  author: 'John Tech',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
};

export const mockApiResponse = {
  success: true,
  message: 'Operation successful',
  data: null,
  statusCode: 200,
};

export const mockErrorResponse = {
  success: false,
  message: 'Operation failed',
  error: 'Internal server error',
  statusCode: 500,
};
