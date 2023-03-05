/**
 * TODO: Add support for implementing remaining action types
 * TODO: Add support for other voting models
 */

import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { GroupMember } from "../groups/group-members/models/group-member.model";
import { DefaultGroupSettings } from "../groups/groups.constants";
import { GroupsService } from "../groups/groups.service";
import { deleteImageFile, saveImage } from "../images/image.utils";
import { ImagesService, ImageTypes } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { User } from "../users/models/user.model";
import { Vote } from "../votes/models/vote.model";
import { VotesService } from "../votes/votes.service";
import { sortConsensusVotesByType } from "../votes/votes.utils";
import { CreateProposalInput } from "./models/create-proposal.input";
import { Proposal } from "./models/proposal.model";
import { UpdateProposalInput } from "./models/update-proposal.input";
import { ProposalActionsService } from "./proposal-actions/proposal-actions.service";
import {
  MIN_GROUP_SIZE_TO_RATIFY,
  MIN_VOTE_COUNT_TO_RATIFY,
  ProposalActionTypes,
  ProposalStages,
} from "./proposals.constants";

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private repository: Repository<Proposal>,

    @Inject(forwardRef(() => VotesService))
    private votesService: VotesService,

    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private proposalActionsService: ProposalActionsService
  ) {}

  async getProposal(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getProposals(where?: FindOptionsWhere<Proposal>) {
    return this.repository.find({ where });
  }

  async getProposalVotesByBatch(proposalIds: number[]) {
    const votes = await this.votesService.getVotes({
      proposalId: In(proposalIds),
    });
    const mappedVotes = proposalIds.map(
      (id) =>
        votes.filter((vote: Vote) => vote.proposalId === id) ||
        new Error(`Could not load votes for proposal: ${id}`)
    );
    return mappedVotes;
  }

  async getProposalImagesByBatch(proposalIds: number[]) {
    const images = await this.imagesService.getImages({
      proposalId: In(proposalIds),
    });
    const mappedImages = proposalIds.map(
      (id) =>
        images.filter((image: Image) => image.proposalId === id) ||
        new Error(`Could not load images for proposal: ${id}`)
    );
    return mappedImages;
  }

  async createProposal(
    {
      images,
      action: { groupCoverPhoto, ...action },
      ...proposalData
    }: CreateProposalInput,
    user: User
  ) {
    const proposal = await this.repository.save({
      ...proposalData,
      userId: user.id,
      action,
    });
    try {
      if (images) {
        await this.saveProposalImages(proposal.id, images);
      }
      if (groupCoverPhoto) {
        await this.proposalActionsService.saveProposalActionImage(
          proposal.action.id,
          groupCoverPhoto,
          ImageTypes.CoverPhoto
        );
      }
    } catch (err) {
      await this.deleteProposal(proposal.id);
      throw new Error(err.message);
    }
    return { proposal };
  }

  async updateProposal({
    id,
    images,
    action: { groupCoverPhoto, ...action },
    ...data
  }: UpdateProposalInput) {
    const proposalWithAction = await this.getProposal(id, ["action"]);
    const newAction = {
      ...proposalWithAction.action,
      ...action,
    };
    const proposal = await this.repository.save({
      ...proposalWithAction,
      ...data,
      action: newAction,
    });

    if (
      groupCoverPhoto &&
      proposal.action.actionType === ProposalActionTypes.ChangeCoverPhoto
    ) {
      await this.imagesService.deleteImage({
        proposalActionId: proposal.action.id,
      });
      await this.proposalActionsService.saveProposalActionImage(
        proposal.action.id,
        groupCoverPhoto,
        ImageTypes.CoverPhoto
      );
    }
    if (images) {
      await this.saveProposalImages(id, images);
    }

    return { proposal };
  }

  async saveProposalImages(proposalId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imagesService.createImage({ filename, proposalId });
    }
  }

  async ratifyProposal(proposalId: number) {
    await this.repository.update(proposalId, {
      stage: ProposalStages.Ratified,
    });
    await this.implementProposal(proposalId);
  }

  async implementProposal(proposalId: number) {
    const {
      action: { actionType, groupDescription, groupCoverPhoto, groupName },
      groupId,
    } = await this.getProposal(proposalId, ["action.groupCoverPhoto"]);

    if (actionType === ProposalActionTypes.ChangeName) {
      await this.groupsService.updateGroup({ id: groupId, name: groupName });
      return;
    }

    if (actionType === ProposalActionTypes.ChangeDescription) {
      await this.groupsService.updateGroup({
        description: groupDescription,
        id: groupId,
      });
      return;
    }

    if (
      actionType === ProposalActionTypes.ChangeCoverPhoto &&
      groupCoverPhoto
    ) {
      const currentCoverPhoto = await this.imagesService.getImage({
        imageType: ImageTypes.CoverPhoto,
        groupId,
      });
      if (!currentCoverPhoto) {
        throw new UserInputError("Could not find group cover photo");
      }
      await this.imagesService.updateImage(groupCoverPhoto.id, { groupId });
      await this.imagesService.deleteImage({ id: currentCoverPhoto.id });
    }
  }

  async isProposalRatifiable(proposalId: number) {
    const proposal = await this.getProposal(proposalId, [
      "group.members",
      "votes",
    ]);
    if (
      proposal.stage !== ProposalStages.Voting ||
      proposal.votes.length < MIN_VOTE_COUNT_TO_RATIFY ||
      proposal.group.members.length < MIN_GROUP_SIZE_TO_RATIFY
    ) {
      return false;
    }

    const {
      group: { members },
      votes,
    } = proposal;

    const ratificationThreshold =
      DefaultGroupSettings.RatificationThreshold * 0.01;

    return this.hasConsensus(ratificationThreshold, members, votes);
  }

  async hasConsensus(
    ratificationThreshold: number,
    groupMembers: GroupMember[],
    votes: Vote[]
  ) {
    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);

    return (
      agreements.length >= groupMembers.length * ratificationThreshold &&
      reservations.length <= DefaultGroupSettings.ReservationsLimit &&
      standAsides.length <= DefaultGroupSettings.StandAsidesLimit &&
      blocks.length === 0
    );
  }

  async deleteProposal(proposalId: number) {
    const images = await this.imagesService.getImages({ proposalId });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.repository.delete(proposalId);
    return true;
  }
}
