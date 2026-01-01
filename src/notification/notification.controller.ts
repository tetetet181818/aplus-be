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
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../utils/types';
import { NotificationGateway } from './notification.gateway';

@Controller('/api/v1/notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly gateway: NotificationGateway,
  ) {}

  /** Get all notifications */
  @Get('/')
  @UseGuards(AuthGuard)
  async getAll(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.getAll(payload.id || '');
  }

  /** Get unread count */
  @Get('/unread-count')
  @UseGuards(AuthGuard)
  async getUnreadCount(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.getUnreadCount(payload.id || '');
  }

  /** Mark single as read */
  @Patch(':id/read')
  @UseGuards(AuthGuard)
  async markAsRead(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
  ) {
    const userId = payload.id || '';
    const result = await this.notificationService.markAsRead(userId, id);
    
    // Emit real-time event
    this.gateway.emitNotificationRead(
      userId,
      result.notification,
      result.unreadCount,
    );
    
    return result.response;
  }

  /** Mark all as read */
  @Patch('/read-all')
  @UseGuards(AuthGuard)
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

  /** Clear all notifications */
  @Delete('/clear-all')
  @UseGuards(AuthGuard)
  async clearAll(@CurrentUser() payload: JwtPayload) {
    const userId = payload.id || '';
    const result = await this.notificationService.clearAll(userId);
    
    // Emit real-time event
    this.gateway.emitNotificationsCleared(userId);
    
    return result;
  }

  @Post()
  @UseGuards(AuthGuard)
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
