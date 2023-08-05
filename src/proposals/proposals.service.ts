/**
 * TODO: Add support for implementing remaining action types
 * TODO: Add support for other voting models
 */

import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { DefaultGroupSetting } from "../groups/groups.constants";
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
import {
  ProposalActionRolesService,
  RoleMemberChangeType,
} from "./proposal-actions/proposal-action-roles/proposal-action-roles.service";
import { ProposalActionsService } from "./proposal-actions/proposal-actions.service";
import {
  MIN_GROUP_SIZE_TO_RATIFY,
  MIN_VOTE_COUNT_TO_RATIFY,
  ProposalActionType,
  ProposalStage,
} from "./proposals.constants";

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private repository: Repository<Proposal>,

    @Inject(forwardRef(() => VotesService))
    private votesService: VotesService,

    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalActionsService: ProposalActionsService
  ) {}

  async getProposal(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getProposals(where?: FindOptionsWhere<Proposal>) {
    return this.repository.find({ where });
  }

  async getProposalVotesBatch(proposalIds: number[]) {
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

  async getProposalImagesBatch(proposalIds: number[]) {
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
      action: { groupCoverPhoto, role, ...action },
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
      if (role) {
        await this.proposalActionRolesService.createProposalActionRole(
          proposal.action.id,
          role
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
      proposal.action.actionType === ProposalActionType.ChangeCoverPhoto
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
      stage: ProposalStage.Ratified,
    });
    await this.implementProposal(proposalId);
  }

  async implementProposal(proposalId: number) {
    const {
      action: { id, actionType, groupDescription, groupName },
      groupId,
    } = await this.getProposal(proposalId, ["action"]);

    if (actionType === ProposalActionType.ChangeName) {
      await this.groupsService.updateGroup({ id: groupId, name: groupName });
      return;
    }

    if (actionType === ProposalActionType.ChangeDescription) {
      await this.groupsService.updateGroup({
        description: groupDescription,
        id: groupId,
      });
      return;
    }

    if (actionType === ProposalActionType.ChangeCoverPhoto) {
      const currentCoverPhoto = await this.imagesService.getImage({
        imageType: ImageTypes.CoverPhoto,
        groupId,
      });
      const newCoverPhoto =
        await this.proposalActionsService.getProposedGroupCoverPhoto(id);

      if (!currentCoverPhoto || !newCoverPhoto) {
        throw new UserInputError("Could not find group cover photo");
      }

      await this.imagesService.updateImage(newCoverPhoto.id, { groupId });
      await this.imagesService.deleteImage({ id: currentCoverPhoto.id });
    }

    if (actionType === ProposalActionType.CreateRole) {
      const role = await this.proposalActionRolesService.getProposalActionRole(
        id,
        ["permission", "members"]
      );
      if (!role) {
        throw new UserInputError("Could not find proposal action role");
      }
      const { name, color, permission } = role;
      const members = role.members?.map(({ userId }) => ({ id: userId }));
      await this.groupRolesService.createGroupRole(
        {
          name,
          color,
          permission,
          groupId,
          members,
        },
        true
      );
    }

    if (actionType === ProposalActionType.ChangeRole) {
      const actionRole =
        await this.proposalActionRolesService.getProposalActionRole(id, [
          "permission",
          "members",
        ]);
      if (!actionRole?.groupRoleId) {
        throw new UserInputError("Could not find proposal action role");
      }
      const roleToUpdate = await this.groupRolesService.getGroupRole({
        id: actionRole.groupRoleId,
      });

      const userIdsToAdd = actionRole.members
        ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Add)
        .map(({ userId }) => userId);

      const userIdsToRemove = actionRole.members
        ?.filter(({ changeType }) => changeType === RoleMemberChangeType.Remove)
        .map(({ userId }) => userId);

      await this.groupRolesService.updateGroupRole({
        id: roleToUpdate.id,
        name: actionRole.name,
        color: actionRole.color,
        selectedUserIds: userIdsToAdd,
        permissions: actionRole.permission,
      });
      if (userIdsToRemove?.length) {
        await this.groupRolesService.deleteGroupRoleMembers(
          roleToUpdate.id,
          userIdsToRemove
        );
      }
      if (actionRole.name || actionRole.color) {
        await this.proposalActionRolesService.updateProposalActionRole(
          actionRole.id,
          {
            oldName: actionRole.name ? roleToUpdate.name : undefined,
            oldColor: actionRole.color ? roleToUpdate.color : undefined,
          }
        );
      }
    }
  }

  async isProposalRatifiable(proposalId: number) {
    const proposal = await this.getProposal(proposalId, [
      "group.members",
      "votes",
    ]);
    if (
      proposal.stage !== ProposalStage.Voting ||
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
      DefaultGroupSetting.RatificationThreshold * 0.01;

    return this.hasConsensus(ratificationThreshold, members, votes);
  }

  async hasConsensus(
    ratificationThreshold: number,
    groupMembers: User[],
    votes: Vote[]
  ) {
    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);

    return (
      agreements.length >= groupMembers.length * ratificationThreshold &&
      reservations.length <= DefaultGroupSetting.ReservationsLimit &&
      standAsides.length <= DefaultGroupSetting.StandAsidesLimit &&
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
