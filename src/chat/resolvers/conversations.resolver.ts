import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
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

  @Query(() => Conversation)
  async vibeChat() {
    return this.chatService.getVibeChat();
  }

  @ResolveField(() => [Message])
  async messages(@Parent() { id }: Conversation) {
    return this.chatService.getConversationMessages(id);
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: Conversation) {
    return this.chatService.getConversationMembers(id);
  }
}
