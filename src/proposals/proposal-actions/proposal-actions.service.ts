import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { saveImage } from "../../images/image.utils";
import { ImagesService } from "../../images/images.service";
import { ProposalAction } from "./models/proposal-action.model";

@Injectable()
export class ProposalActionsService {
  constructor(
    @InjectRepository(ProposalAction)
    private repository: Repository<ProposalAction>,
    private imagesService: ImagesService
  ) {}

  async getProposalAction(
    where: FindOptionsWhere<ProposalAction>,
    relations?: string[]
  ) {
    return this.repository.findOne({ where, relations });
  }

  async getProposalActions(where?: FindOptionsWhere<ProposalAction>) {
    return this.repository.find({ where });
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
