import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { ValidationError } from "apollo-server-express";
import { CreateProposalInput } from "../models/create-proposal.input";
import { ProposalActionTypes } from "../proposals.constants";

@Injectable()
export class CreateProposalValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateProposalInput.name) {
      await this.validateProposalAction(value);
      await this.validateGroupId(value);
    }
    return value;
  }

  async validateProposalAction({ action }: CreateProposalInput) {
    if (!action) {
      throw new ValidationError("Proposals must include an action");
    }
    const { actionType, groupCoverPhoto, groupDescription, groupName } = action;
    if (actionType === ProposalActionTypes.ChangeName && !groupName) {
      throw new ValidationError(
        "Proposals to change group name must include a name field"
      );
    }
    if (
      actionType === ProposalActionTypes.ChangeDescription &&
      !groupDescription
    ) {
      throw new ValidationError(
        "Proposals to change group description must include a description field"
      );
    }
    if (
      actionType === ProposalActionTypes.ChangeCoverPhoto &&
      !groupCoverPhoto
    ) {
      throw new ValidationError(
        "Proposals to change group cover photo must include an image"
      );
    }
  }

  // TODO: Remove once support for server proposals has been added
  async validateGroupId({ groupId }: CreateProposalInput) {
    if (!groupId) {
      throw new ValidationError(
        "Only group proposals are supported at this time"
      );
    }
  }
}
