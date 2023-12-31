import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Image } from '../../images/models/image.model';
import { Proposal } from '../models/proposal.model';
import { ProposalsService } from '../proposals.service';
import { ProposalAction } from './models/proposal-action.model';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionRole } from './models/proposal-action-role.model';
import { ProposalActionsService } from './proposal-actions.service';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';

@Resolver(() => ProposalAction)
export class ProposalActionsResolver {
  constructor(
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
  ) {}

  @ResolveField(() => Proposal)
  async proposal(@Parent() { proposalId }: ProposalAction) {
    return this.proposalsService.getProposal(proposalId);
  }

  @ResolveField(() => ProposalActionRole)
  async role(@Parent() { id }: ProposalAction) {
    return this.proposalActionsService.getProposalActionRole({
      proposalActionId: id,
    });
  }

  @ResolveField(() => ProposalActionEvent)
  async event(@Parent() { id }: ProposalAction) {
    return this.proposalActionsService.getProposalActionEvent({
      proposalActionId: id,
    });
  }

  @ResolveField(() => ProposalActionGroupConfig, { nullable: true })
  async groupSettings(@Parent() { id }: ProposalActionGroupConfig) {
    return this.proposalActionsService.getProposalActionGroupConfig({
      proposalActionId: id,
    });
  }

  @ResolveField(() => Image, { nullable: true })
  async groupCoverPhoto(@Parent() { id }: ProposalAction) {
    return this.proposalActionsService.getProposedGroupCoverPhoto(id);
  }
}
