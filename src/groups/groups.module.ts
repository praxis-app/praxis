import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationMember } from '../chat/models/conversation-member.model';
import { Conversation } from '../chat/models/conversation.model';
import { EventsModule } from '../events/events.module';
import { Image } from '../images/models/image.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { UsersModule } from '../users/users.module';
import { GroupRolesModule } from './group-roles/group-roles.module';
import { GroupsService } from './groups.service';
import { GroupConfig } from './models/group-config.model';
import { GroupMemberRequest } from './models/group-member-request.model';
import { Group } from './models/group.model';
import { GroupConfigsResolver } from './resolvers/group-configs.resolver';
import { GroupMemberRequestsResolver } from './resolvers/group-member-requests.resolver';
import { GroupsResolver } from './resolvers/groups.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationMember,
      Group,
      GroupConfig,
      GroupMemberRequest,
      Image,
      Post,
      Proposal,
      User,
    ]),
    EventsModule,
    GroupRolesModule,
    NotificationsModule,
    UsersModule,
  ],
  providers: [
    GroupConfigsResolver,
    GroupMemberRequestsResolver,
    GroupsResolver,
    GroupsService,
  ],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
