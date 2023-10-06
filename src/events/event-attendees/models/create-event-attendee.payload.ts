import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from '../../models/event.model';

@ObjectType()
export class CreateEventAttendeePayload {
  @Field()
  event: Event;
}
