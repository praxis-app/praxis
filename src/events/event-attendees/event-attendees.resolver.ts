import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { User } from '../../users/models/user.model';
import { EventAttendeesService } from './event-attendees.service';
import { CreateEventAttendeeInput } from './models/create-event-attendee.input';
import { CreateEventAttendeePayload } from './models/create-event-attendee.payload';
import { EventAttendee } from './models/event-attendee.model';
import { UpdateEventAttendeeInput } from './models/update-event-attendee.input';
import { UpdateEventAttendeePayload } from './models/update-event-attendee.payload';

@Resolver(() => EventAttendee)
export class EventAttendeesResolver {
  constructor(private eventAttendeesService: EventAttendeesService) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: EventAttendee,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @Mutation(() => CreateEventAttendeePayload)
  async createEventAttendee(
    @Args('eventAttendeeData') eventData: CreateEventAttendeeInput,
    @CurrentUser() { id }: User,
  ) {
    return this.eventAttendeesService.createEventAttendee(eventData, id);
  }

  @Mutation(() => UpdateEventAttendeePayload)
  async updateEventAttendee(
    @Args('eventAttendeeData') eventData: UpdateEventAttendeeInput,
    @CurrentUser() { id }: User,
  ) {
    return this.eventAttendeesService.updateEventAttendee(eventData, id);
  }

  @Mutation(() => Boolean)
  async deleteEventAttendee(
    @Args('eventId', { type: () => Int }) eventId: number,
    @CurrentUser() { id }: User,
  ) {
    return this.eventAttendeesService.deleteEventAttendee(eventId, id);
  }
}
