import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from './message.model';

@ObjectType()
export class UpdateMessagePayload {
  @Field()
  message: Message;
}
