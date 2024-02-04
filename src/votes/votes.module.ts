import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { QuestionnaireTicket } from '../questions/models/questionnaire-ticket.model';
import { Vote } from './models/vote.model';
import { VotesResolver } from './votes.resolver';
import { VotesService } from './votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, QuestionnaireTicket]),
    NotificationsModule,
    ProposalsModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
