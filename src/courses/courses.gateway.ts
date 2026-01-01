import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: ['https://aplusplatformsa.com', 'http://localhost:3000'] },
  namespace: '/courses',
})
export class CoursesGateway {
  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) await client.join(userId);
  }

  emitProgress(userId: string, progress: number, message: string) {
    this.server.to(userId).emit('upload-progress', {
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  emitComplete(userId: string, data: any) {
    this.server.to(userId).emit('upload-complete', {
      data,
      timestamp: new Date().toISOString(),
    });
  }

  emitError(userId: string, error: string) {
    this.server.to(userId).emit('upload-error', {
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

