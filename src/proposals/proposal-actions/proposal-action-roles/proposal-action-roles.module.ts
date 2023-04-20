import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProposalActionRole } from "./models/proposal-action-role.model";
import { ProposalActionRolesResolver } from "./proposal-action-roles.resolver";
import { ProposalActionRolesService } from "./proposal-action-roles.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProposalActionRole])],
  providers: [ProposalActionRolesResolver, ProposalActionRolesService],
  exports: [ProposalActionRolesService],
})
export class ProposalActionRolesModule {}
