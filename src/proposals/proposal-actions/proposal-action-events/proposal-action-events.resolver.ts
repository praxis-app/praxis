import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Image } from '../../../images/models/image.model';
import { User } from '../../../users/models/user.model';
import { ProposalAction } from '../models/proposal-action.model';
import { ProposalActionsService } from '../proposal-actions.service';
import { ProposalActionEvent } from './models/proposal-action-event.model';
import { ProposalActionEventsService } from './proposal-action-events.service';

@Resolver(() => ProposalActionEvent)
export class ProposalActionEventsResolver {
  constructor(
    private proposalActionEventsService: ProposalActionEventsService,
    private proposalActionsService: ProposalActionsService,
  ) {}

  @ResolveField(() => User)
  async host(@Parent() { id }: ProposalActionEvent) {
    return this.proposalActionEventsService.getProposalActionEventHost(id);
  }

  @ResolveField(() => Image, { nullable: true })
  async coverPhoto(@Parent() { id }: ProposalActionEvent) {
    return this.proposalActionEventsService.getProposalActionEventCoverPhoto(
      id,
    );
  }

  @ResolveField(() => ProposalAction)
  async proposalAction(@Parent() { proposalActionId }: ProposalActionEvent) {
    return this.proposalActionsService.getProposalAction({
      id: proposalActionId,
    });
  }
}
