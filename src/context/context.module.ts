import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommentsModule } from '../comments/comments.module';
import { DataloaderModule } from '../dataloader/dataloader.module';
import { EventsModule } from '../events/events.module';
import { GroupConfigsModule } from '../groups/group-configs/group-configs.module';
import { GroupMemberRequestsModule } from '../groups/group-member-requests/group-member-requests.module';
import { GroupRolesModule } from '../groups/group-roles/group-roles.module';
import { GroupsModule } from '../groups/groups.module';
import { ImagesModule } from '../images/images.module';
import { PostsModule } from '../posts/posts.module';
import { ProposalActionEventsModule } from '../proposals/proposal-actions/proposal-action-events/proposal-action-events.module';
import { ProposalActionRolesModule } from '../proposals/proposal-actions/proposal-action-roles/proposal-action-roles.module';
import { ProposalActionsModule } from '../proposals/proposal-actions/proposal-actions.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { ShieldModule } from '../shield/shield.module';
import { UsersModule } from '../users/users.module';
import { ContextService } from './context.service';

@Module({
  imports: [
    AuthModule,
    CommentsModule,
    DataloaderModule,
    EventsModule,
    GroupConfigsModule,
    GroupMemberRequestsModule,
    GroupRolesModule,
    GroupsModule,
    ImagesModule,
    PostsModule,
    ProposalActionEventsModule,
    ProposalActionRolesModule,
    ProposalActionsModule,
    ProposalsModule,
    ShieldModule,
    UsersModule,
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
