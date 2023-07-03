import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Dataloaders } from "../dataloader/dataloader.types";
import { Group } from "../groups/models/group.model";
import { Post } from "../posts/models/post.model";
import { User } from "../users/models/user.model";
import { EventsService } from "./events.service";
import { CreateEventInput } from "./models/create-event.input";
import { CreateEventPayload } from "./models/create-event.payload";
import { Event } from "./models/event.model";
import { UpdateEventInput } from "./models/update-event.input";
import { UpdateEventPayload } from "./models/update-event.payload";

@Resolver(() => Event)
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Query(() => Event)
  async event(@Args("id", { type: () => Int, nullable: true }) id: number) {
    return this.eventsService.getEvent({ id });
  }

  @Query(() => [Event])
  async events() {
    return this.eventsService.getEvents();
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Post
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @Mutation(() => CreateEventPayload)
  async createEvent(
    @Args("eventData") eventData: CreateEventInput,
    @CurrentUser() { id }: User
  ) {
    return this.eventsService.createEvent(eventData, id);
  }

  @Mutation(() => UpdateEventPayload)
  async updateEvent(@Args("eventData") eventData: UpdateEventInput) {
    return this.eventsService.updateEvent(eventData);
  }

  @Mutation(() => Boolean)
  async deleteEvent(@Args("id", { type: () => Int }) id: number) {
    return this.eventsService.deleteEvent(id);
  }
}
