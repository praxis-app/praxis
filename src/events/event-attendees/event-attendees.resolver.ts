import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { User } from "../../users/models/user.model";
import { EventAttendeesService } from "./event-attendees.service";
import { EventAttendee } from "./models/event-attendee.model";

@Resolver(() => EventAttendee)
export class EventAttendeesResolver {
  constructor(private eventAttendeesService: EventAttendeesService) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: EventAttendee
  ) {
    return loaders.usersLoader.load(userId);
  }

  @Mutation(() => Boolean)
  async deleteEvent(@Args("id", { type: () => Int }) id: number) {
    return this.eventAttendeesService.deleteEventAttendee(id);
  }
}
