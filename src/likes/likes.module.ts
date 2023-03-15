import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LikesResolver } from "./likes.resolver";
import { LikesService } from "./likes.service";
import { Like } from "./models/like.model";

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [LikesService, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
