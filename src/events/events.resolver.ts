import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Dataloaders } from "../dataloader/dataloader.types";
import { Group } from "../groups/models/group.model";
import { Post } from "../posts/models/post.model";
import { EventsService } from "./events.service";
import { Event } from "./models/event.model";

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
}
