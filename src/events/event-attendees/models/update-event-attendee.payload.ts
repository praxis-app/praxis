import { Field, ObjectType } from "@nestjs/graphql";
import { EventAttendee } from "./event-attendee.model";

@ObjectType()
export class UpdateEventAttendeePayload {
  @Field()
  eventAttendee: EventAttendee;
}
