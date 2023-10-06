import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupRolesModule } from '../../groups/group-roles/group-roles.module';
import { ImagesModule } from '../../images/images.module';
import { ProposalsModule } from '../proposals.module';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionEventsModule } from './proposal-action-events/proposal-action-events.module';
import { ProposalActionRolesModule } from './proposal-action-roles/proposal-action-roles.module';
import { ProposalActionsResolver } from './proposal-actions.resolver';
import { ProposalActionsService } from './proposal-actions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalAction]),
    forwardRef(() => ProposalActionEventsModule),
    forwardRef(() => ProposalsModule),
    GroupRolesModule,
    ImagesModule,
    ProposalActionRolesModule,
  ],
  providers: [ProposalActionsService, ProposalActionsResolver],
  exports: [ProposalActionsService],
})
export class ProposalActionsModule {}
