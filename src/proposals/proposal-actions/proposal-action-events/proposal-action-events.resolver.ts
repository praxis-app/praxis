import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Image } from "../../../images/models/image.model";
import { ProposalActionEventHost } from "./models/proposal-action-event-host.model";
import { ProposalActionEvent } from "./models/proposal-action-event.model";
import { ProposalActionEventsService } from "./proposal-action-events.service";

@Resolver(() => ProposalActionEvent)
export class ProposalActionEventsResolver {
  constructor(
    private proposalActionEventsService: ProposalActionEventsService
  ) {}

  @ResolveField(() => ProposalActionEventHost)
  async host(@Parent() { id }: ProposalActionEvent) {
    return this.proposalActionEventsService.getProposalActionEventHost(id);
  }

  @ResolveField(() => Image, { nullable: true })
  async coverPhoto(@Parent() { id }: ProposalActionEvent) {
    return this.proposalActionEventsService.getProposalActionEventCoverPhoto(
      id
    );
  }
}
