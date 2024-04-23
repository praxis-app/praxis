import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { ServerRole } from '../server-roles/models/server-role.model';
import { ChatService } from './chat.service';
import { Conversation } from './models/conversation.model';
import { Message } from './models/message.model';
import { ConversationsResolver } from './resolvers/conversations.resolver';
import { MessagesResolver } from './resolvers/messages.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      Image,
      ServerConfig,
      ServerRole,
    ]),
    ServerConfigsModule,
  ],
  providers: [ChatService, MessagesResolver, ConversationsResolver],
})
export class ChatModule {}
