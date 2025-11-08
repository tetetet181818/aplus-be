// notifications.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: { origin: ['https://aplusplatformsa.com', 'http://localhost:3000'] },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notif: NotificationService) {}

  emitNewNotification(n) {
    this.server.emit('notification', n);
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) await client.join(userId);
  }

  emitToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
