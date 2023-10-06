import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from './event.model';

@ObjectType()
export class UpdateEventPayload {
  @Field()
  event: Event;
}
