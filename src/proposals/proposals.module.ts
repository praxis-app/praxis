import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { GroupsModule } from '../groups/groups.module';
import { ImagesModule } from '../images/images.module';
import { VotesModule } from '../votes/votes.module';
import { Proposal } from './models/proposal.model';
import { ProposalActionEventsModule } from './proposal-actions/proposal-action-events/proposal-action-events.module';
import { ProposalActionRolesModule } from './proposal-actions/proposal-action-roles/proposal-action-roles.module';
import { ProposalActionsModule } from './proposal-actions/proposal-actions.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal]),
    forwardRef(() => CommentsModule),
    forwardRef(() => ProposalActionsModule),
    forwardRef(() => VotesModule),
    GroupsModule,
    ImagesModule,
    ProposalActionEventsModule,
    ProposalActionRolesModule,
  ],
  providers: [ProposalsService, ProposalsResolver],
  exports: [ProposalsService, TypeOrmModule],
})
export class ProposalsModule {}
