import { Module } from '@nestjs/common';
import { ChatResolver } from './chat.resolver';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService, ChatResolver],
})
export class ChatModule {}
