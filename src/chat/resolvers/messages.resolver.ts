import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Image } from '../../images/models/image.model';
import { User } from '../../users/models/user.model';
import { ChatService } from '../chat.service';
import { Message } from '../models/message.model';
import { SendMessageInput } from '../models/send-message.input';
import { SendMessagePayload } from '../models/send-message.payload';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(private chatService: ChatService) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Message,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Message,
  ) {
    return loaders.messageImagesLoader.load(id);
  }

  @Mutation(() => SendMessagePayload)
  async sendMessage(
    @Args('messageData') messageData: SendMessageInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.chatService.sendMessage(messageData, currentUser);
  }
}
