import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { CommentsModule } from '../comments/comments.module';
import { DataloaderModule } from '../dataloader/dataloader.module';
import { EventsModule } from '../events/events.module';
import { GroupRolesModule } from '../groups/group-roles/group-roles.module';
import { GroupsModule } from '../groups/groups.module';
import { ImagesModule } from '../images/images.module';
import { LikesModule } from '../likes/likes.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsModule } from '../posts/posts.module';
import { ProposalActionsModule } from '../proposals/proposal-actions/proposal-actions.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { RulesModule } from '../rules/rules.module';
import { ShieldModule } from '../shield/shield.module';
import { UsersModule } from '../users/users.module';
import { VibeCheckModule } from '../vibe-check/vibe-check.module';
import { ContextService } from './context.service';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    CommentsModule,
    DataloaderModule,
    EventsModule,
    GroupRolesModule,
    GroupsModule,
    ImagesModule,
    LikesModule,
    NotificationsModule,
    PostsModule,
    ProposalActionsModule,
    ProposalsModule,
    RulesModule,
    ShieldModule,
    UsersModule,
    VibeCheckModule,
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
