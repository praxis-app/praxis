import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalActionGroupConfig } from '../models/proposal-action-group-config.model';
import { ProposalActionGroupConfigsResolver } from './proposal-action-group-configs.resolver';
import { ProposalActionGroupConfigsService } from './proposal-action-group-configs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalActionGroupConfig])],
  providers: [
    ProposalActionGroupConfigsService,
    ProposalActionGroupConfigsResolver,
  ],
})
export class ProposalActionGroupConfigsModule {}
