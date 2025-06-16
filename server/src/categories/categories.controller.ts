import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoryResponse,
  CategoryListResponse,
} from './dto/category-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleEnum } from '../common/enums/roles.enum';
import { Auth } from '@/auth/decorators';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter to show only active categories',
    example: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved categories',
    type: CategoryListResponse,
  })
  @Auth()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCategories(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<any[]> {
    const showActiveOnly = activeOnly !== 'false';
    return await this.categoriesService.getAllCategories(showActiveOnly);
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved category',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @Auth()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCategoryById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return await this.categoriesService.getCategoryById(id);
  }

  @ApiOperation({ summary: 'Create new category (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  @Roles(RoleEnum.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    const result = await this.categoriesService.createCategory(
      createCategoryDto.name,
      createCategoryDto.description,
    );
    return { message: result.message };
  }

  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID to update',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Category with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const result = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
    );
    return { message: result.message };
  }

  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID to delete',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponse> {
    const result = await this.categoriesService.deleteCategory(id);
    return { message: result.message };
  }

  @ApiOperation({ summary: 'Toggle category active status (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID to toggle status',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category status toggled successfully',
    type: CategoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions - Admin role required',
  })
  @Roles(RoleEnum.ADMIN)
  @Put(':id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleCategoryStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CategoryResponse> {
    const result = await this.categoriesService.toggleCategoryStatus(id);
    return { message: result.message };
  }
}
