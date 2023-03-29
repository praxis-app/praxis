import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupsModule } from "../groups/groups.module";
import { ProposalsModule } from "../proposals/proposals.module";
import { Vote } from "./models/vote.model";
import { VotesResolver } from "./votes.resolver";
import { VotesService } from "./votes.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote]),
    forwardRef(() => ProposalsModule),
    GroupsModule,
  ],
  providers: [VotesService, VotesResolver],
  exports: [VotesService],
})
export class VotesModule {}
