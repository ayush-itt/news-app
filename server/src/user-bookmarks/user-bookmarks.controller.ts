import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserBookmarksService } from './user-bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import { BookmarkResponseDto, BookmarkStatusDto } from './dto';

@ApiTags('User Bookmarks')
@Controller('user-bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserBookmarksController {
  constructor(private readonly userBookmarksService: UserBookmarksService) {}

  @Post(':articleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 201,
    description: 'Article bookmarked successfully',
    type: BookmarkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Article already bookmarked' })
  async bookmarkArticle(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<BookmarkResponseDto> {
    const bookmark = await this.userBookmarksService.bookmarkArticle(
      user.id,
      articleId,
    );
    return {
      id: bookmark.id,
      userId: bookmark.userId,
      articleId: bookmark.articleId,
      article: bookmark.article,
      createdAt: bookmark.createdAt,
    };
  }

  @Delete(':articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bookmark from article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark removed successfully',
    type: BookmarkStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Article or bookmark not found' })
  async removeBookmark(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<BookmarkStatusDto> {
    await this.userBookmarksService.removeBookmark(user.id, articleId);
    return {
      message: 'Bookmark removed successfully',
      success: true,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookmarked articles' })
  @ApiResponse({
    status: 200,
    description: 'User bookmarked articles retrieved successfully',
    type: [BookmarkResponseDto],
  })
  async getUserBookmarks(
    @GetUser() user: User,
  ): Promise<BookmarkResponseDto[]> {
    const bookmarks = await this.userBookmarksService.getUserBookmarks(user.id);
    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      userId: bookmark.userId,
      articleId: bookmark.articleId,
      article: bookmark.article,
      createdAt: bookmark.createdAt,
    }));
  }

  @Get('check/:articleId')
  @ApiOperation({ summary: 'Check if article is bookmarked by user' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isBookmarked: { type: 'boolean' },
        articleId: { type: 'number' },
      },
    },
  })
  async isArticleBookmarked(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<{ isBookmarked: boolean; articleId: number }> {
    const isBookmarked =
      await this.userBookmarksService.isArticleBookmarkedByUser(
        user.id,
        articleId,
      );
    return {
      isBookmarked,
      articleId,
    };
  }
}
