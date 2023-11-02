import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server } from 'ws';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private prisma: PrismaService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    console.log('Inside the websocket gateway');
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    console.log('Inside the websocket gateway');
    return data;
  }

  @SubscribeMessage('create')
  async createUser(@MessageBody() { name }: { name: string }): Promise<any> {
    console.log('Inside the websocket gateway');
    return await this.prisma.user.create({
      data: {
        name: name,
      },
    });
  }

  // function which receives user message and sends it to all users
  @SubscribeMessage('message')
  async onChatMessage(
    @MessageBody() message: string,
  ): Promise<WsResponse<string>> {
    console.log('Inside the websocket gateway');
    this.server.emit('message', message);
    console.log('message', message);
    return { event: 'message', data: message };
  }
}
