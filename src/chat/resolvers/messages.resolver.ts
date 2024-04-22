import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ChatService } from '../chat.service';
import { Message } from '../models/message.model';
import { SendMessageInput } from '../models/send-message.input';
import { SendMessagePayload } from '../models/send-message.payload';
import { User } from '../../users/models/user.model';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

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
}
