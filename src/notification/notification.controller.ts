import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { NotificationGateway } from './notification.gateway';
import { ValidateObjectIdPipe } from '../pipes/validate-object-id.pipe';

@ApiTags('Notifications')
@Controller('/api/v1/notifications')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly gateway: NotificationGateway,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  async getAll(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.getAll(payload.id || '');
  }

  @Get('/unread-count')
  @ApiOperation({ summary: 'Get the count of unread notifications' })
  async getUnreadCount(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.getUnreadCount(payload.id || '');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiParam({ name: 'id', description: 'ID of the notification' })
  async markAsRead(
    @CurrentUser() payload: JwtPayload,
    @Param('id', ValidateObjectIdPipe) id: string,
  ) {
    const userId = payload.id || '';
    const result = await this.notificationService.markAsRead(userId, id);

    this.gateway.emitNotificationRead(
      userId,
      result.notification,
      result.unreadCount,
    );

    return result.response;
  }

  @Patch('/read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read for the current user',
  })
  async markAllAsRead(@CurrentUser() payload: JwtPayload) {
    const userId = payload.id || '';
    const result = await this.notificationService.markAllAsRead(userId);

    // Emit real-time event
    this.gateway.emitAllNotificationsRead(
      userId,
      result.updatedCount,
      result.unreadCount,
    );

    return result.response;
  }

  @Delete('/clear-all')
  @ApiOperation({ summary: 'Delete all notifications for the current user' })
  async clearAll(@CurrentUser() payload: JwtPayload) {
    const userId = payload.id || '';
    const result = await this.notificationService.clearAll(userId);

    // Emit real-time event
    this.gateway.emitNotificationsCleared(userId);

    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification (Testing/Trigger)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        type: { type: 'string', enum: ['info', 'success', 'warning', 'error'] },
      },
      required: ['title', 'message'],
    },
  })
  async create(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { title: string; message: string; type?: string },
  ) {
    const userId = payload.id || '';
    const result = await this.notificationService.create({
      userId,
      title: body.title,
      message: body.message,
      type: body.type as 'info' | 'success' | 'warning' | 'error',
    });

    // Real-time emission is handled by the service
    return result.response;
  }
}
