import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAttendee } from '../../events/event-attendees/models/event-attendee.model';
import { Event } from '../../events/models/event.model';
import { GroupConfigsModule } from '../../groups/group-configs/group-configs.module';
import { GroupRolesModule } from '../../groups/group-roles/group-roles.module';
import { Image } from '../../images/models/image.model';
import { ProposalsModule } from '../proposals.module';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';
import { ProposalActionPermission } from './models/proposal-action-permission.model';
import { ProposalActionRoleMember } from './models/proposal-action-role-member.model';
import { ProposalActionRole } from './models/proposal-action-role.model';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionEventHostsResolver } from './proposal-action-event-hosts.resolver';
import { ProposalActionEventsResolver } from './proposal-action-events.resolver';
import { ProposalActionGroupConfigsResolver } from './proposal-action-group-configs.resolver';
import { ProposalActionRolesResolver } from './proposal-action-roles.resolver';
import { ProposalActionsResolver } from './proposal-actions.resolver';
import { ProposalActionsService } from './proposal-actions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventAttendee,
      Image,
      ProposalAction,
      ProposalActionEvent,
      ProposalActionEventHost,
      ProposalActionGroupConfig,
      ProposalActionPermission,
      ProposalActionRole,
      ProposalActionRoleMember,
    ]),
    forwardRef(() => ProposalsModule),
    GroupConfigsModule,
    GroupRolesModule,
  ],
  providers: [
    ProposalActionEventHostsResolver,
    ProposalActionEventsResolver,
    ProposalActionGroupConfigsResolver,
    ProposalActionRolesResolver,
    ProposalActionsResolver,
    ProposalActionsService,
  ],
  exports: [ProposalActionsService],
})
export class ProposalActionsModule {}
