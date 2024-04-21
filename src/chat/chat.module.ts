import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagesResolver } from './resolvers/messages.resolver';

@Module({
  providers: [ChatService, MessagesResolver],
})
export class ChatModule {}
