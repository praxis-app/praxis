import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events/events.module';
import { ImagesModule } from '../images/images.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { GroupConfigsModule } from './group-configs/group-configs.module';
import { GroupMemberRequestsModule } from './group-member-requests/group-member-requests.module';
import { GroupRolesModule } from './group-roles/group-roles.module';
import { GroupsResolver } from './groups.resolver';
import { GroupsService } from './groups.service';
import { Group } from './models/group.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => GroupConfigsModule),
    forwardRef(() => GroupMemberRequestsModule),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
    EventsModule,
    GroupRolesModule,
    ImagesModule,
  ],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
