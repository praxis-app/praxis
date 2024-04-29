import { Inject } from '@nestjs/common';
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User } from '../../users/models/user.model';
import { ChatService } from '../chat.service';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    private chatService: ChatService,
  ) {}

  @Query(() => Conversation)
  async conversation(@Args('id', { type: () => Int }) id: number) {
    return this.chatService.getConversation(id);
  }

  @Query(() => Conversation)
  async vibeChat() {
    return this.chatService.getVibeChat();
  }

  @ResolveField(() => [Message])
  async messages(
    @Parent() { id }: Conversation,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.chatService.getConversationMessages(id, offset, limit);
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: Conversation) {
    return this.chatService.getConversationMembers(id);
  }

  @Subscription(() => Message)
  newMessage(
    @Args('conversationId', { type: () => Int }) conversationId: number,
    @CurrentUser() currentUser: User,
  ) {
    return this.pubSub.asyncIterator(
      `new-message-${conversationId}-${currentUser.id}`,
    );
  }
}
