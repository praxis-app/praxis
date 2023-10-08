import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAttendeesModule } from '../../../events/event-attendees/event-attendees.module';
import { EventsModule } from '../../../events/events.module';
import { ImagesModule } from '../../../images/images.module';
import { UsersModule } from '../../../users/users.module';
import { ProposalActionsModule } from '../proposal-actions.module';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionEventHostsResolver } from './proposal-action-event-hosts.resolver';
import { ProposalActionEventsResolver } from './proposal-action-events.resolver';
import { ProposalActionEventsService } from './proposal-action-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalActionEvent, ProposalActionEventHost]),
    forwardRef(() => ProposalActionsModule),
    forwardRef(() => UsersModule),
    EventAttendeesModule,
    EventsModule,
    ImagesModule,
  ],
  providers: [
    ProposalActionEventsService,
    ProposalActionEventsResolver,
    ProposalActionEventHostsResolver,
  ],
  exports: [ProposalActionEventsService],
})
export class ProposalActionEventsModule {}
