import {
  Controller,
  Put,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserReactionsService } from './user-reactions.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../database/entities/user.entity';
import {
  ReactionRequestDto,
  ReactionResponseDto,
  ReactionStatsDto,
  ReactionStatusDto,
} from './dto';
import { Auth } from '@/auth/decorators';

@ApiTags('User Reactions')
@Controller('user-reactions')
@Auth()
export class UserReactionsController {
  constructor(private readonly userReactionsService: UserReactionsService) {}

  @Put(':articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'React to an article (like/dislike) or toggle off reaction',
  })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Reaction updated successfully',
    type: ReactionResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Reaction removed successfully (same reaction = toggle off)',
    type: ReactionStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async reactToArticle(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() reactionDto: ReactionRequestDto,
  ): Promise<ReactionResponseDto | ReactionStatusDto> {
    const reaction = await this.userReactionsService.reactToArticle(
      user.id,
      articleId,
      reactionDto.reaction,
    );

    if (reaction) {
      // Reaction created or updated
      return {
        id: reaction.id,
        userId: reaction.userId,
        articleId: reaction.articleId,
        reactionType: reaction.reactionType,
        article: reaction.article,
        createdAt: reaction.createdAt,
        updatedAt: reaction.updatedAt,
      };
    } else {
      // Reaction removed (toggle off)
      return {
        message: 'Reaction removed successfully',
        success: true,
      };
    }
  }

  @Get('my-reactions')
  @ApiOperation({ summary: 'Get all user reactions' })
  @ApiResponse({
    status: 200,
    description: 'User reactions retrieved successfully',
    type: [ReactionResponseDto],
  })
  async getUserReactions(
    @GetUser() user: User,
  ): Promise<ReactionResponseDto[]> {
    const reactions = await this.userReactionsService.getUserReactions(user.id);
    return reactions.map((reaction) => ({
      id: reaction.id,
      userId: reaction.userId,
      articleId: reaction.articleId,
      reactionType: reaction.reactionType,
      article: reaction.article,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    }));
  }

  @Get('likes')
  @ApiOperation({ summary: 'Get user liked articles' })
  @ApiResponse({
    status: 200,
    description: 'User liked articles retrieved successfully',
    type: [ReactionResponseDto],
  })
  async getUserLikedArticles(
    @GetUser() user: User,
  ): Promise<ReactionResponseDto[]> {
    const reactions = await this.userReactionsService.getUserLikedArticles(
      user.id,
    );
    return reactions.map((reaction) => ({
      id: reaction.id,
      userId: reaction.userId,
      articleId: reaction.articleId,
      reactionType: reaction.reactionType,
      article: reaction.article,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    }));
  }

  @Get('dislikes')
  @ApiOperation({ summary: 'Get user disliked articles' })
  @ApiResponse({
    status: 200,
    description: 'User disliked articles retrieved successfully',
    type: [ReactionResponseDto],
  })
  async getUserDislikedArticles(
    @GetUser() user: User,
  ): Promise<ReactionResponseDto[]> {
    const reactions = await this.userReactionsService.getUserDislikedArticles(
      user.id,
    );
    return reactions.map((reaction) => ({
      id: reaction.id,
      userId: reaction.userId,
      articleId: reaction.articleId,
      reactionType: reaction.reactionType,
      article: reaction.article,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    }));
  }

  @Get('stats/:articleId')
  @ApiOperation({ summary: 'Get article reaction statistics' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article reaction stats retrieved successfully',
    type: ReactionStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticleReactionStats(
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<ReactionStatsDto> {
    const stats =
      await this.userReactionsService.getArticleReactionStats(articleId);
    return {
      likes: stats.likes,
      dislikes: stats.dislikes,
      articleId,
    };
  }

  @Get('my-reaction/:articleId')
  @ApiOperation({ summary: 'Get user reaction for specific article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'User reaction for article retrieved successfully',
    type: ReactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Article not found or no reaction' })
  async getUserReactionForArticle(
    @GetUser() user: User,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<ReactionResponseDto | null> {
    const reaction = await this.userReactionsService.getUserReactionForArticle(
      user.id,
      articleId,
    );

    if (!reaction) {
      return null;
    }

    return {
      id: reaction.id,
      userId: reaction.userId,
      articleId: reaction.articleId,
      reactionType: reaction.reactionType,
      article: reaction.article,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
    };
  }
}
