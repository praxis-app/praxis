import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { ChatService } from './chat.service';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { ConversationsResolver } from './resolvers/conversations.resolver';
import { MessagesResolver } from './resolvers/messages.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation, Image])],
  providers: [ChatService, MessagesResolver, ConversationsResolver],
})
export class ChatModule {}
