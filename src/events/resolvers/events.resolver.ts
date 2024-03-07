import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Group } from '../../groups/models/group.model';
import { Image } from '../../images/models/image.model';
import { Post } from '../../posts/models/post.model';
import { User } from '../../users/models/user.model';
import { EventsService } from '../events.service';
import { CreateEventInput } from '../models/create-event.input';
import { CreateEventPayload } from '../models/create-event.payload';
import { EventAttendee } from '../models/event-attendee.model';
import { Event } from '../models/event.model';
import { EventsInput } from '../models/events.input';
import { UpdateEventInput } from '../models/update-event.input';
import { UpdateEventPayload } from '../models/update-event.payload';

@Resolver(() => Event)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => Event)
  async event(@Args('id', { type: () => Int, nullable: true }) id: number) {
    return this.eventsService.getEvent({ id });
  }

  @Query(() => [Event])
  async events(@Args('input') input: EventsInput, @CurrentUser() user: User) {
    if (!user?.verified) {
      return this.eventsService.getPublicEvents(input);
    }
    return this.eventsService.getFilteredEvents(input);
  }

  @ResolveField(() => [EventAttendee])
  async attendees(@Parent() { id }: Event) {
    return this.eventsService.getEventAttendees({ eventId: id });
  }

  @ResolveField(() => Int)
  async interestedCount(
    @Parent() { id }: Event,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.interestedCountLoader.load(id);
  }

  @ResolveField(() => Int)
  async goingCount(
    @Parent() { id }: Event,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.goingCountLoader.load(id);
  }

  @ResolveField(() => String, { nullable: true })
  async attendingStatus(
    @CurrentUser() { id: currentUserId }: User,
    @Parent() { id }: Event,
  ) {
    return this.eventsService.getAttendingStatus(id, currentUserId);
  }

  @ResolveField(() => User, { nullable: true })
  async host(@Parent() { id }: Event) {
    return this.eventsService.getEventHost(id);
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Event,
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @ResolveField(() => [Post])
  async posts(
    @Parent() { id }: Event,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.eventsService.getEventPosts(id, offset, limit);
  }

  @ResolveField(() => Int)
  async postsCount(@Parent() { id }: Event) {
    return this.eventsService.getEventPostsCount(id);
  }

  @ResolveField(() => Image)
  async coverPhoto(
    @Parent() { id }: Event,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.eventCoverPhotosLoader.load(id);
  }

  @Mutation(() => CreateEventPayload)
  async createEvent(@Args('eventData') eventData: CreateEventInput) {
    return this.eventsService.createEvent(eventData);
  }

  @Mutation(() => UpdateEventPayload)
  async updateEvent(@Args('eventData') eventData: UpdateEventInput) {
    return this.eventsService.updateEvent(eventData);
  }

  @Mutation(() => Boolean)
  async deleteEvent(@Args('id', { type: () => Int }) id: number) {
    return this.eventsService.deleteEvent(id);
  }
}
