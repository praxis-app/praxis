import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupsModule } from "../groups/groups.module";
import { ImagesModule } from "../images/images.module";
import { RolesModule } from "../roles/roles.module";
import { VotesModule } from "../votes/votes.module";
import { Proposal } from "./models/proposal.model";
import { ProposalActionRolesModule } from "./proposal-actions/proposal-action-roles/proposal-action-roles.module";
import { ProposalActionsModule } from "./proposal-actions/proposal-actions.module";
import { ProposalsResolver } from "./proposals.resolver";
import { ProposalsService } from "./proposals.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal]),
    forwardRef(() => ProposalActionsModule),
    forwardRef(() => VotesModule),
    ProposalActionRolesModule,
    GroupsModule,
    ImagesModule,
    RolesModule,
  ],
  providers: [ProposalsService, ProposalsResolver],
  exports: [ProposalsService, TypeOrmModule],
})
export class ProposalsModule {}
