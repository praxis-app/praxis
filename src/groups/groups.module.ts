import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { Image } from '../images/models/image.model';
import { UsersModule } from '../users/users.module';
import { GroupConfigsResolver } from './resolvers/group-configs.resolver';
import { GroupMemberRequestsResolver } from './resolvers/group-member-requests.resolver';
import { GroupRolesModule } from './group-roles/group-roles.module';
import { GroupsResolver } from './resolvers/groups.resolver';
import { GroupsService } from './groups.service';
import { GroupConfig } from './models/group-config.model';
import { GroupMemberRequest } from './models/group-member-request.model';
import { Group } from './models/group.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupConfig, GroupMemberRequest, Image]),

    // TODO: Remove forwardRef() when circular dependency is fixed
    forwardRef(() => UsersModule),

    EventsModule,
    GroupRolesModule,
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
