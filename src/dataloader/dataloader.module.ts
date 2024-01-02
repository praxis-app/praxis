import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/models/event.model';
import { GroupRole } from '../groups/group-roles/models/group-role.model';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { PostsModule } from '../posts/posts.module';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { ProposalsModule } from '../proposals/proposals.module';
import { ServerRole } from '../server-roles/models/server-role.model';
import { UsersModule } from '../users/users.module';
import { VotesModule } from '../votes/votes.module';
import { DataloaderService } from './dataloader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Group,
      GroupRole,
      Image,
      ProposalAction,
      ServerRole,
    ]),
    PostsModule,
    ProposalsModule,
    UsersModule,
    VotesModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
