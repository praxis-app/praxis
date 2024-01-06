import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
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
      Group,
      GroupConfig,
      GroupMemberRequest,
      Image,
      Post,
      Proposal,
    ]),
    EventsModule,
    GroupRolesModule,
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
