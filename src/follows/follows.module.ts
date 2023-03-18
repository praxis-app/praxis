import { Module } from "@nestjs/common";
import { FollowsService } from "./follows.service";
import { FollowsResolver } from "./follows.resolver";

@Module({
  providers: [FollowsService, FollowsResolver],
})
export class FollowsModule {}
