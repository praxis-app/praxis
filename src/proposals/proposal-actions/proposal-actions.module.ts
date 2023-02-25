import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../../images/images.module";
import { ProposalsModule } from "../proposals.module";
import { ProposalAction } from "./models/proposal-action.model";
import { ProposalActionsResolver } from "./proposal-actions.resolver";
import { ProposalActionsService } from "./proposal-actions.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalAction]),
    forwardRef(() => ProposalsModule),
    ImagesModule,
  ],
  providers: [ProposalActionsService, ProposalActionsResolver],
  exports: [ProposalActionsService],
})
export class ProposalActionsModule {}
