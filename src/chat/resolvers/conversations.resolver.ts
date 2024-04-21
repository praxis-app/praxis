import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Conversation } from '../models/conversation.model';
import { ChatService } from '../chat.service';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private chatService: ChatService) {}

  @Query(() => Conversation)
  async conversation(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.getConversation(id);
  }
}
