import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../../../users/models/user.model';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEventsService } from './proposal-action-events.service';

@Resolver(() => ProposalActionEventHost)
export class ProposalActionEventHostsResolver {
  constructor(
    private proposalActionEventsService: ProposalActionEventsService,
  ) {}

  @ResolveField(() => User)
  async user(@Parent() { userId }: ProposalActionEventHost) {
    return this.proposalActionEventsService.getProposalActionEventHost(userId);
  }
}
