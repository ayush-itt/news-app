import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { EmailService } from '@/email/email.service';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { User } from '@/database/entities/user.entity';
import {
  NotificationResponseDto,
  PaginatedNotificationResponseDto,
  NotificationQueryDto,
} from './dto';
import { Auth } from '@/auth/decorators';

@ApiTags('Notifications')
@Controller('notifications')
@Auth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'isRead',
    required: false,
    description: 'Filter by read status',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: PaginatedNotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserNotifications(
    @GetUser() user: User,
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedNotificationResponseDto> {
    return this.notificationsService.getUserNotifications(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@GetUser() user: User): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markNotificationAsRead(user.id, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@GetUser() user: User): Promise<{ count: number }> {
    return this.notificationsService.markAllNotificationsAsRead(user.id);
  }

  @Post('test-email')
  @ApiOperation({
    summary: 'Test email notification (Development only)',
    description: 'Sends a test email to verify email configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Test email sent successfully' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestEmail(
    @GetUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    const testEmailData = {
      userId: user.id,
      userEmail: user.email,
      userName: user.username,
      articles: [
        {
          id: 1,
          title: 'Test Article: Breaking News in Technology',
          url: 'https://example.com/test-article-1',
          category: 'Technology',
          keyword: 'AI',
        },
        {
          id: 2,
          title: 'Test Article: Sports Update',
          url: 'https://example.com/test-article-2',
          category: 'Sports',
        },
      ],
    };

    const success =
      await this.emailService.sendNotificationEmail(testEmailData);

    return {
      success,
      message: success
        ? 'Test email sent successfully'
        : 'Failed to send test email. Check server logs for details.',
    };
  }
}
