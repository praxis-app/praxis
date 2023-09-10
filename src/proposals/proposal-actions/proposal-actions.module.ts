import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../../images/images.module";
import { ProposalsModule } from "../proposals.module";
import { ProposalAction } from "./models/proposal-action.model";
import { ProposalActionRolesModule } from "./proposal-action-roles/proposal-action-roles.module";
import { ProposalActionsResolver } from "./proposal-actions.resolver";
import { ProposalActionsService } from "./proposal-actions.service";
import { ProposalActionEventsModule } from "./proposal-action-events/proposal-action-events.module";
import { EventsModule } from "../../events/events.module";
import { GroupRolesModule } from "../../groups/group-roles/group-roles.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalAction]),
    forwardRef(() => ProposalActionEventsModule),
    forwardRef(() => ProposalsModule),
    EventsModule,
    GroupRolesModule,
    ImagesModule,
    ProposalActionRolesModule,
  ],
  providers: [ProposalActionsService, ProposalActionsResolver],
  exports: [ProposalActionsService],
})
export class ProposalActionsModule {}
