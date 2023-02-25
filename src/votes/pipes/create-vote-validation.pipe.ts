import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ValidationError } from "apollo-server-express";
import { ProposalStages } from "../../proposals/proposals.constants";
import { ProposalsService } from "../../proposals/proposals.service";
import { CreateVoteInput } from "../models/create-vote.input";

@Injectable()
export class CreateVoteValidationPipe implements PipeTransform {
  constructor(private proposalsService: ProposalsService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateVoteInput.name) {
      await this.validateProposalStage(value);
    }
    return value;
  }

  async validateProposalStage(value: CreateVoteInput) {
    const proposal = await this.proposalsService.getProposal(value.proposalId);
    if (proposal.stage === ProposalStages.Ratified) {
      throw new ValidationError(
        "Proposal has been ratified and can no longer be voted on"
      );
    }
  }
}
