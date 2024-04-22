import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/models/user.model';
import { ChatService } from '../chat.service';
import { Message } from '../models/message.model';
import { SendMessageInput } from '../models/send-message.input';
import { SendMessagePayload } from '../models/send-message.payload';
import { UpdateMessageInput } from '../models/update-message.input';
import { UpdateMessagePayload } from '../models/update-message.payload';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private chatService: ChatService) {}

  @Mutation(() => SendMessagePayload)
  async sendMessage(
    @Args('messageData') messageData: SendMessageInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.chatService.sendMessage(messageData, currentUser);
  }

  @Mutation(() => UpdateMessagePayload)
  async updateMessage(@Args('messageData') messageData: UpdateMessageInput) {
    return this.chatService.updateMessage(messageData);
  }

  @Mutation(() => Boolean)
  async deleteMessage(
    @Args('messageId', { type: () => Int }) messageId: number,
  ) {
    return this.chatService.deleteMessage(messageId);
  }
}
