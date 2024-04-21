import { Resolver } from '@nestjs/graphql';
import { Message } from '../models/message.model';

@Resolver(() => Message)
export class MessagesResolver {}
