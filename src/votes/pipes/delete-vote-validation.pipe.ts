import { Injectable, PipeTransform } from "@nestjs/common";
import { ValidationError } from "apollo-server-express";
import { ProposalStages } from "../../proposals/proposals.constants";
import { VotesService } from "../votes.service";

@Injectable()
export class DeleteVoteValidationPipe implements PipeTransform {
  constructor(private votesService: VotesService) {}

  async transform(value: any) {
    if (typeof value === "number") {
      await this.validateProposalStage(value);
    }
    return value;
  }

  async validateProposalStage(value: number) {
    const { proposal } = await this.votesService.getVote(value, ["proposal"]);
    if (proposal.stage === ProposalStages.Ratified) {
      throw new ValidationError(
        "Proposal has been ratified and can no longer be voted on"
      );
    }
  }
}
