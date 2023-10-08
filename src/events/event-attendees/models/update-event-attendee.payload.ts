import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from '../../models/event.model';

@ObjectType()
export class UpdateEventAttendeePayload {
  @Field()
  event: Event;
}
