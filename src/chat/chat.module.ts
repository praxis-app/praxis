import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConversationsResolver } from './resolvers/conversations.resolver';
import { MessagesResolver } from './resolvers/messages.resolver';

@Module({
  providers: [ChatService, MessagesResolver, ConversationsResolver],
})
export class ChatModule {}
