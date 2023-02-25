import { Module } from "@nestjs/common";
import { GroupMembersModule } from "../groups/group-members/group-members.module";
import { GroupsModule } from "../groups/groups.module";
import { MemberRequestsModule } from "../groups/member-requests/member-requests.module";
import { PostsModule } from "../posts/posts.module";
import { ProposalActionsModule } from "../proposals/proposal-actions/proposal-actions.module";
import { ProposalsModule } from "../proposals/proposals.module";
import { RoleMembersModule } from "../roles/role-members/role-members.module";
import { UsersModule } from "../users/users.module";
import { VotesModule } from "../votes/votes.module";
import { DataloaderService } from "./dataloader.service";

@Module({
  imports: [
    GroupMembersModule,
    GroupsModule,
    MemberRequestsModule,
    PostsModule,
    ProposalActionsModule,
    ProposalsModule,
    RoleMembersModule,
    UsersModule,
    VotesModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
