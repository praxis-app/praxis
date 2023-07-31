import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { RefreshTokensModule } from "../auth/refresh-tokens/refresh-tokens.module";
import { ShieldModule } from "../auth/shield/shield.module";
import { DatabaseModule } from "../database/database.module";
import { DataloaderModule } from "../dataloader/dataloader.module";
import { EventsModule } from "../events/events.module";
import { GroupMemberRequestsModule } from "../groups/group-member-requests/group-member-requests.module";
import { GroupRolesModule } from "../groups/group-roles/group-roles.module";
import { GroupsModule } from "../groups/groups.module";
import { ImagesModule } from "../images/images.module";
import { LikesModule } from "../likes/likes.module";
import { PostsModule } from "../posts/posts.module";
import { ProposalsModule } from "../proposals/proposals.module";
import { ServerInvitesModule } from "../server-invites/server-invites.module";
import { ServerRolesModule } from "../server-roles/server-roles.module";
import { UsersModule } from "../users/users.module";
import { VotesModule } from "../votes/votes.module";
import { ApolloModule } from "./apollo.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ApolloModule,
    AuthModule,
    DatabaseModule,
    DataloaderModule,
    EventsModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    PostsModule,
    ProposalsModule,
    RefreshTokensModule,
    ServerInvitesModule,
    ServerRolesModule,
    ShieldModule,
    UsersModule,
    VotesModule,
  ],
})
export class AppModule {}
