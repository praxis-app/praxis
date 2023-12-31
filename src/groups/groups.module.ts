import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { Image } from '../images/models/image.model';
import { ProposalsModule } from '../proposals/proposals.module';
import { UsersModule } from '../users/users.module';
import { GroupConfigsModule } from './group-configs/group-configs.module';
import { GroupMemberRequestsModule } from './group-member-requests/group-member-requests.module';
import { GroupRolesModule } from './group-roles/group-roles.module';
import { GroupsResolver } from './groups.resolver';
import { GroupsService } from './groups.service';
import { Group } from './models/group.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, Image]),
    forwardRef(() => GroupConfigsModule),
    forwardRef(() => GroupMemberRequestsModule),
    forwardRef(() => ProposalsModule),
    forwardRef(() => UsersModule),
    EventsModule,
    GroupRolesModule,
  ],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
