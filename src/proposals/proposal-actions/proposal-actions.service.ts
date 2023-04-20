import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { saveImage } from "../../images/image.utils";
import { ImagesService } from "../../images/images.service";
import { ProposalActionRoleInput } from "./models/proposal-action-role-input";
import { ProposalActionRole } from "./models/proposal-action-role.model";
import { ProposalAction } from "./models/proposal-action.model";

export enum RoleMemberChangeType {
  Add = "add",
  Remove = "remove",
}

@Injectable()
export class ProposalActionsService {
  constructor(
    @InjectRepository(ProposalAction)
    private proposalActionRepository: Repository<ProposalAction>,

    @InjectRepository(ProposalActionRole)
    private proposalActionRoleRepository: Repository<ProposalActionRole>,

    private imagesService: ImagesService
  ) {}

  async getProposalAction(
    where: FindOptionsWhere<ProposalAction>,
    relations?: string[]
  ) {
    return this.proposalActionRepository.findOne({ where, relations });
  }

  async getProposalActions(where?: FindOptionsWhere<ProposalAction>) {
    return this.proposalActionRepository.find({ where });
  }

  async getProposalActionRole(proposalActionId: number) {
    return this.proposalActionRoleRepository.findOne({
      where: { proposalActionId },
    });
  }

  async getProposedGroupCoverPhoto(proposalActionId: number) {
    const action = await this.getProposalAction({ id: proposalActionId }, [
      "groupCoverPhoto",
    ]);
    return action?.groupCoverPhoto;
  }

  async getProposalActionsByBatch(proposalIds: number[]) {
    const proposalActions = await this.getProposalActions({
      proposalId: In(proposalIds),
    });
    return proposalIds.map(
      (id) =>
        proposalActions.find(
          (proposalAction: ProposalAction) => proposalAction.id === id
        ) || new Error(`Could not load proposal action: ${id}`)
    );
  }

  // TODO: Add logic to account for proposals to *change* group roles
  async saveProposalActionRole(
    proposalActionId: number,
    { id, selectedUserIds, ...role }: ProposalActionRoleInput
  ) {
    const members = selectedUserIds
      ? selectedUserIds.map((userId) => ({
          changeType: RoleMemberChangeType.Add,
          userId,
        }))
      : [];

    await this.proposalActionRoleRepository.save({
      ...role,
      roleId: id,
      proposalActionId,
      members,
    });
  }

  async saveProposalActionImage(
    proposalActionId: number,
    image: Promise<FileUpload>,
    imageType: string
  ) {
    const filename = await saveImage(image);
    await this.imagesService.createImage({
      filename,
      imageType,
      proposalActionId,
    });
  }
}
