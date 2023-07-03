import { Resolver } from "@nestjs/graphql";
import { Event } from "./models/event.model";

@Resolver(() => Event)
export class EventsResolver {}
