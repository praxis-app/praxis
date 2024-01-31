import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Event } from '../events/models/event.model';
import { GroupRole } from '../groups/group-roles/models/group-role.model';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { Answer } from '../questions/models/answer.model';
import { ServerRole } from '../server-roles/models/server-role.model';
import { UsersModule } from '../users/users.module';
import { Vote } from '../votes/models/vote.model';
import { DataloaderService } from './dataloader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Answer,
      Comment,
      Event,
      Group,
      GroupRole,
      Image,
      Like,
      Post,
      Proposal,
      ProposalAction,
      ServerRole,
      Vote,
    ]),
    UsersModule,
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
