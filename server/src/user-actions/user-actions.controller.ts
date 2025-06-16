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
import { UserActionsService } from './user-actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import { LikeResponseDto, BookmarkResponseDto, ActionStatusDto } from './dto';

@ApiTags('User Actions')
@Controller('user-actions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserActionsController {
  constructor(private readonly userActionsService: UserActionsService) {}

  @Post('like/:articleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Like an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 201,
    description: 'Article liked successfully',
    type: LikeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiResponse({ status: 409, description: 'Article already liked' })
  async likeArticle(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<LikeResponseDto> {
    const like = await this.userActionsService.likeArticle(user.id, articleId);
    return {
      id: like.id,
      userId: like.userId,
      articleId: like.articleId,
      article: like.article,
      createdAt: like.createdAt,
    };
  }

  @Delete('like/:articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article unliked successfully',
    type: ActionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Article or like not found' })
  async unlikeArticle(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<ActionStatusDto> {
    await this.userActionsService.unlikeArticle(user.id, articleId);
    return {
      message: 'Article unliked successfully',
      success: true,
    };
  }

  @Get('likes')
  @ApiOperation({ summary: 'Get user liked articles' })
  @ApiResponse({
    status: 200,
    description: 'User liked articles retrieved successfully',
    type: [LikeResponseDto],
  })
  async getUserLikes(@GetUser() user: User): Promise<LikeResponseDto[]> {
    const likes = await this.userActionsService.getUserLikes(user.id);
    return likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      articleId: like.articleId,
      article: like.article,
      createdAt: like.createdAt,
    }));
  }

  // Bookmark Operations
  @Post('bookmark/:articleId')
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
    const bookmark = await this.userActionsService.bookmarkArticle(
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

  @Delete('bookmark/:articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove bookmark from article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Bookmark removed successfully',
    type: ActionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Article or bookmark not found' })
  async removeBookmark(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<ActionStatusDto> {
    await this.userActionsService.removeBookmark(user.id, articleId);
    return {
      message: 'Bookmark removed successfully',
      success: true,
    };
  }

  @Get('bookmarks')
  @ApiOperation({ summary: 'Get user bookmarked articles' })
  @ApiResponse({
    status: 200,
    description: 'User bookmarked articles retrieved successfully',
    type: [BookmarkResponseDto],
  })
  async getUserBookmarks(
    @GetUser() user: User,
  ): Promise<BookmarkResponseDto[]> {
    const bookmarks = await this.userActionsService.getUserBookmarks(user.id);
    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      userId: bookmark.userId,
      articleId: bookmark.articleId,
      article: bookmark.article,
      createdAt: bookmark.createdAt,
    }));
  }

  // // Statistics
  // @Get('like-count/:articleId')
  // @ApiOperation({ summary: 'Get article like count' })
  // @ApiParam({ name: 'articleId', description: 'Article ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Article like count retrieved successfully',
  //   type: LikeCountDto,
  // })
  // async getArticleLikeCount(
  //   @Param('articleId', ParseIntPipe) articleId: number,
  // ): Promise<LikeCountDto> {
  //   const count = await this.userActionsService.getArticleLikeCount(articleId);
  //   return {
  //     count,
  //     articleId,
  //   };
  // }
}
