import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionsService } from './proposal-actions.service';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';

@Resolver(() => ProposalActionGroupConfig)
export class ProposalActionGroupConfigsResolver {
  constructor(private proposalActionsService: ProposalActionsService) {}

  @ResolveField(() => ProposalAction)
  async proposalAction(
    @Parent() { proposalActionId }: ProposalActionGroupConfig,
  ) {
    return this.proposalActionsService.getProposalAction({
      id: proposalActionId,
    });
  }
}
