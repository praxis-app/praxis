import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAttendee } from '../../events/models/event-attendee.model';
import { Event } from '../../events/models/event.model';
import { GroupRolesModule } from '../../groups/group-roles/group-roles.module';
import { GroupsModule } from '../../groups/groups.module';
import { Image } from '../../images/models/image.model';
import { ProposalsModule } from '../proposals.module';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';
import { ProposalActionPermission } from './models/proposal-action-permission.model';
import { ProposalActionRoleMember } from './models/proposal-action-role-member.model';
import { ProposalActionRole } from './models/proposal-action-role.model';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionsService } from './proposal-actions.service';
import { ProposalActionEventHostsResolver } from './resolvers/proposal-action-event-hosts.resolver';
import { ProposalActionEventsResolver } from './resolvers/proposal-action-events.resolver';
import { ProposalActionGroupConfigsResolver } from './resolvers/proposal-action-group-configs.resolver';
import { ProposalActionRolesResolver } from './resolvers/proposal-action-roles.resolver';
import { ProposalActionsResolver } from './resolvers/proposal-actions.resolver';

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
    GroupsModule,
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
