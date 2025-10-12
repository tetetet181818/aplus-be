// notifications.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: ['https://aplusplatformsa.com'] } })
export class NotificationGateway {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) await client.join(userId);
  }

  emitToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
