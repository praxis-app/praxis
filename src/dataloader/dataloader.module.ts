import { Module } from "@nestjs/common";
import { GroupsModule } from "../groups/groups.module";
import { MemberRequestsModule } from "../groups/member-requests/member-requests.module";
import { PostsModule } from "../posts/posts.module";
import { ProposalActionsModule } from "../proposals/proposal-actions/proposal-actions.module";
import { ProposalsModule } from "../proposals/proposals.module";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { VotesModule } from "../votes/votes.module";
import { DataloaderService } from "./dataloader.service";

@Module({
  imports: [
    GroupsModule,
    MemberRequestsModule,
    PostsModule,
    ProposalActionsModule,
    ProposalsModule,
    RolesModule,
    UsersModule,
    VotesModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
