import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from './message.model';

@ObjectType()
export class SendMessagePayload {
  @Field()
  message: Message;
}
