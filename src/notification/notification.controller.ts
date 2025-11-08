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

  /**  Get all notifications */
  @Get('/')
  @UseGuards(AuthGuard)
  async getAll(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.getAll(payload.id || '');
  }

  /**  Mark single as read */
  @Patch(':id/read')
  @UseGuards(AuthGuard)
  async markAsRead(
    @CurrentUser() payload: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(payload.id || '', id);
  }

  /**  Mark all as read */
  @Patch('/read-all')
  @UseGuards(AuthGuard)
  async markAllAsRead(@CurrentUser() payload: JwtPayload) {
    return this.notificationService.markAllAsRead(payload.id || '');
  }

  /**  Clear all notifications */
  @Delete('/clear-all')
  @UseGuards(AuthGuard)
  async clearAll(@CurrentUser() payload: JwtPayload) {
    this.gateway.server.emit('clear');
    return this.notificationService.clearAll(payload.id || '');
  }

  @Post()
  async create(
    @CurrentUser() payload: JwtPayload,
    @Body() body: { title: string; message: string; type?: string },
  ) {
    this.gateway.emitNewNotification(body);
    return this.notificationService.create({
      userId: payload.id || '',
      title: body.title,
      message: body.message,
      type: body.type as 'info' | 'success' | 'warning' | 'error',
    });
  }
}
