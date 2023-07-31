import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApolloModule } from "./apollo.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { DataloaderModule } from "../dataloader/dataloader.module";
import { EventsModule } from "../events/events.module";
import { GroupsModule } from "../groups/groups.module";
import { ImagesModule } from "../images/images.module";
import { LikesModule } from "../likes/likes.module";
import { PostsModule } from "../posts/posts.module";
import { ProposalsModule } from "../proposals/proposals.module";
import { ServerInvitesModule } from "../server-invites/server-invites.module";
import { ServerRolesModule } from "../server-roles/server-roles.module";
import { UsersModule } from "../users/users.module";
import { VotesModule } from "../votes/votes.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApolloModule,
    AuthModule,
    DatabaseModule,
    DataloaderModule,
    EventsModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    PostsModule,
    ProposalsModule,
    ServerInvitesModule,
    ServerRolesModule,
    UsersModule,
    VotesModule,
  ],
})
export class AppModule {}
