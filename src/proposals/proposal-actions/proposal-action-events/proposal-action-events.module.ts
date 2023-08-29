import { Module } from "@nestjs/common";
import { ProposalActionEventsResolver } from "./proposal-action-events.resolver";
import { ProposalActionEventsService } from "./proposal-action-events.service";

@Module({
  providers: [ProposalActionEventsService, ProposalActionEventsResolver],
})
export class ProposalActionEventsModule {}
