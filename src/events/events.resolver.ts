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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { User } from '../users/models/user.model';
import { EventAttendeesService } from './event-attendees/event-attendees.service';
import { EventAttendee } from './event-attendees/models/event-attendee.model';
import { EventsService } from './events.service';
import { CreateEventInput } from './models/create-event.input';
import { CreateEventPayload } from './models/create-event.payload';
import { Event } from './models/event.model';
import { EventsInput } from './models/events.input';
import { UpdateEventInput } from './models/update-event.input';
import { UpdateEventPayload } from './models/update-event.payload';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private eventsService: EventsService,
    private eventAttendeesService: EventAttendeesService,
    private postsService: PostsService,
  ) {}

  @Query(() => Event)
  async event(@Args('id', { type: () => Int, nullable: true }) id: number) {
    return this.eventsService.getEvent({ id });
  }

  @Query(() => [Event])
  async events(@Args('input') input: EventsInput, @CurrentUser() user: User) {
    if (!user) {
      return this.eventsService.getPublicEvents(input);
    }
    return this.eventsService.getFilteredEvents(input);
  }

  @ResolveField(() => [EventAttendee])
  async attendees(@Parent() { id }: Event) {
    return this.eventAttendeesService.getEventAttendees({ eventId: id });
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

  @ResolveField(() => User)
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
  async posts(@Parent() { id }: Event) {
    return this.postsService.getPosts({ eventId: id });
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
