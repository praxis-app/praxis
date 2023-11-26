import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupConfigsModule } from '../../groups/group-configs/group-configs.module';
import { GroupRolesModule } from '../../groups/group-roles/group-roles.module';
import { ImagesModule } from '../../images/images.module';
import { ProposalsModule } from '../proposals.module';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionEventsModule } from './proposal-action-events/proposal-action-events.module';
import { ProposalActionGroupConfigsModule } from './proposal-action-group-configs/proposal-action-group-configs.module';
import { ProposalActionRolesModule } from './proposal-action-roles/proposal-action-roles.module';
import { ProposalActionsResolver } from './proposal-actions.resolver';
import { ProposalActionsService } from './proposal-actions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalAction]),
    forwardRef(() => ProposalActionEventsModule),
    forwardRef(() => ProposalActionGroupConfigsModule),
    forwardRef(() => ProposalsModule),
    forwardRef(() => ImagesModule),
    GroupConfigsModule,
    GroupRolesModule,
    ProposalActionRolesModule,
  ],
  providers: [ProposalActionsService, ProposalActionsResolver],
  exports: [ProposalActionsService],
})
export class ProposalActionsModule {}
