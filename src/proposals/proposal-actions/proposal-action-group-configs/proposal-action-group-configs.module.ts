import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';
import { ProposalActionGroupConfigsResolver } from './proposal-action-group-configs.resolver';
import { ProposalActionGroupConfigsService } from './proposal-action-group-configs.service';
import { ProposalActionsModule } from '../proposal-actions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalActionGroupConfig]),
    forwardRef(() => ProposalActionsModule),
  ],
  providers: [
    ProposalActionGroupConfigsService,
    ProposalActionGroupConfigsResolver,
  ],
  exports: [ProposalActionGroupConfigsService],
})
export class ProposalActionGroupConfigsModule {}
