import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../../../users/models/user.model';
import { ProposalActionEventHost } from '../models/proposal-action-event-host.model';
import { ProposalActionsService } from '../proposal-actions.service';

@Resolver(() => ProposalActionEventHost)
export class ProposalActionEventHostsResolver {
  constructor(private proposalActionsService: ProposalActionsService) {}

  @ResolveField(() => User)
  async user(@Parent() { userId }: ProposalActionEventHost) {
    return this.proposalActionsService.getProposalActionEventHost(userId);
  }
}
