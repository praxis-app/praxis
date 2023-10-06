import { Module } from '@nestjs/common';
import { GroupRolesModule } from '../groups/group-roles/group-roles.module';
import { GroupsModule } from '../groups/groups.module';
import { GroupMemberRequestsModule } from '../groups/group-member-requests/group-member-requests.module';
import { PostsModule } from '../posts/posts.module';
import { ProposalActionsModule } from '../proposals/proposal-actions/proposal-actions.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { ServerRolesModule } from '../server-roles/server-roles.module';
import { UsersModule } from '../users/users.module';
import { VotesModule } from '../votes/votes.module';
import { DataloaderService } from './dataloader.service';
import { EventsModule } from '../events/events.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    CommentsModule,
    EventsModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    PostsModule,
    ProposalActionsModule,
    ProposalsModule,
    ServerRolesModule,
    UsersModule,
    VotesModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
