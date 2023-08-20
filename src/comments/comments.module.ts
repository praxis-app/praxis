import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { CommentsResolver } from "./comments.resolver";
import { CommentsService } from "./comments.service";
import { Comment } from "./models/comment.model";

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), ImagesModule],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
