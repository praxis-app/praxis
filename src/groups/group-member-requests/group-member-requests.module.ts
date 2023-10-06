import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups.module';
import { GroupMemberRequestsResolver } from './group-member-requests.resolver';
import { GroupMemberRequestsService } from './group-member-requests.service';
import { GroupMemberRequest } from './models/group-member-request.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMemberRequest]),
    forwardRef(() => GroupsModule),
  ],
  providers: [GroupMemberRequestsResolver, GroupMemberRequestsService],
  exports: [GroupMemberRequestsService],
})
export class GroupMemberRequestsModule {}
