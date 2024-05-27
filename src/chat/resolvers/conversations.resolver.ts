import { Inject } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { ChatService } from '../chat.service';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

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
    @Parent() conversation: Conversation,
    @CurrentUser() currentUser: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.chatService.getConversationMessages(
      conversation.id,
      currentUser.id,
      offset,
      limit,
    );
  }

  @ResolveField(() => Int)
  async unreadMessageCount(
    @CurrentUser() currentUser: User,
    @Parent() { id }: Conversation,
  ) {
    return this.chatService.getUnreadMessageCount(id, currentUser.id);
  }

  @ResolveField(() => Message, { nullable: true })
  async lastMessageSent(@Parent() { id }: Conversation) {
    return this.chatService.getLastMessageSent(id);
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: Conversation) {
    return this.chatService.getConversationMembers(id);
  }

  @ResolveField(() => Group, { nullable: true })
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Conversation,
  ) {
    if (!groupId) {
      return null;
    }
    return loaders.groupsLoader.load(groupId);
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
