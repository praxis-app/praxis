import { Resolver } from "@nestjs/graphql";
import { Follow } from "./models/follow.model";

@Resolver(() => Follow)
export class FollowsResolver {}
