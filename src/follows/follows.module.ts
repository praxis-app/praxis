import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FollowsResolver } from "./follows.resolver";
import { FollowsService } from "./follows.service";
import { Follow } from "./models/follow.model";

@Module({
  imports: [TypeOrmModule.forFeature([Follow])],
  providers: [FollowsService, FollowsResolver],
})
export class FollowsModule {}
