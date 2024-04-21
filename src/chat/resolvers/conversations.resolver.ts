import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ChatService } from '../chat.service';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private chatService: ChatService) {}

  @Query(() => Conversation)
  async conversation(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.getConversation(id);
  }

  @ResolveField(() => [Message])
  async messages(@Parent() { id }: Conversation) {
    return this.chatService.getConversationMessages(id);
  }
}
