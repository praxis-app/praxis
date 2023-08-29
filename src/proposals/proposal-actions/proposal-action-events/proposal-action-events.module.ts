import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProposalActionEvent } from "./models/proposal-action-event.model";
import { ProposalActionEventsResolver } from "./proposal-action-events.resolver";
import { ProposalActionEventsService } from "./proposal-action-events.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProposalActionEvent])],
  providers: [ProposalActionEventsService, ProposalActionEventsResolver],
})
export class ProposalActionEventsModule {}
