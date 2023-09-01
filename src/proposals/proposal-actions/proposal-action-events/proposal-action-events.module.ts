import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../../../images/images.module";
import { ProposalActionEventHost } from "./models/proposal-action-event-host.model";
import { ProposalActionEvent } from "./models/proposal-action-event.model";
import { ProposalActionEventsResolver } from "./proposal-action-events.resolver";
import { ProposalActionEventsService } from "./proposal-action-events.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalActionEvent, ProposalActionEventHost]),
    ImagesModule,
  ],
  providers: [ProposalActionEventsService, ProposalActionEventsResolver],
  exports: [ProposalActionEventsService],
})
export class ProposalActionEventsModule {}
