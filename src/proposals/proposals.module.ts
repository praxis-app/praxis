import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { Image } from '../images/models/image.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { PubSubModule } from '../pub-sub/pub-sub.module';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { Vote } from '../votes/models/vote.model';
import { ProposalConfig } from './models/proposal-config.model';
import { Proposal } from './models/proposal.model';
import { ProposalActionsModule } from './proposal-actions/proposal-actions.module';
import { ProposalsResolver } from './proposals.resolver';
import { ProposalsService } from './proposals.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image,
      Proposal,
      ProposalConfig,
      ServerConfig,
      Vote,
    ]),
    forwardRef(() => ProposalActionsModule),
    NotificationsModule,
    GroupsModule,
    PubSubModule,
  ],
  providers: [ProposalsService, ProposalsResolver],
  exports: [ProposalsService, TypeOrmModule],
})
export class ProposalsModule {}
