// notifications.gateway.ts
import { Inject, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: { origin: ['https://aplusplatformsa.com', 'http://localhost:3000'] },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notif: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await client.join(userId);
      // Send unread count when user connects
      const unreadCount = await this.notif.getUnreadCount(userId);
      client.emit('unread-count', unreadCount.data);
    }
  }

  /** Emit new notification to specific user */
  emitNewNotification(userId: string, notification: any) {
    this.server.to(userId).emit('new-notification', notification);
    // Also emit unread count update
    this.notif.getUnreadCount(userId).then((result) => {
      this.server.to(userId).emit('unread-count-updated', result.data);
    });
  }

  /** Emit notification marked as read */
  emitNotificationRead(userId: string, notification: any, unreadCount: number) {
    this.server.to(userId).emit('notification-read', {
      notification,
      unreadCount,
    });
    this.server.to(userId).emit('unread-count-updated', { unreadCount });
  }

  /** Emit all notifications marked as read */
  emitAllNotificationsRead(userId: string, updatedCount: number, unreadCount: number) {
    this.server.to(userId).emit('all-notifications-read', {
      updatedCount,
      unreadCount,
    });
    this.server.to(userId).emit('unread-count-updated', { unreadCount });
  }

  /** Emit notifications cleared */
  emitNotificationsCleared(userId: string) {
    this.server.to(userId).emit('notifications-cleared');
    this.server.to(userId).emit('unread-count-updated', { unreadCount: 0 });
  }

  /** Emit unread count update */
  emitUnreadCountUpdate(userId: string, unreadCount: number) {
    this.server.to(userId).emit('unread-count-updated', { unreadCount });
  }

  /** Legacy method for backward compatibility */
  emitToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
