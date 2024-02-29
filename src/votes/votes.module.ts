import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
import { VibeCheckModule } from '../vibe-check/vibe-check.module';
import { User } from '../users/models/user.model';
import { Vote } from './models/vote.model';
import { VotesResolver } from './votes.resolver';
import { VotesService } from './votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, User, QuestionnaireTicket]),
    NotificationsModule,
    ProposalsModule,
    VibeCheckModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
