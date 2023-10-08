/**
 * TODO: Add support for implementing remaining action types
 * TODO: Add support for other voting models
 */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { ImagesService, ImageTypes } from '../images/images.service';
import { Image } from '../images/models/image.model';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { VotesService } from '../votes/votes.service';
import { sortConsensusVotesByType } from '../votes/votes.utils';
import { CreateProposalInput } from './models/create-proposal.input';
import { Proposal } from './models/proposal.model';
import { UpdateProposalInput } from './models/update-proposal.input';
import { ProposalActionEventsService } from './proposal-actions/proposal-action-events/proposal-action-events.service';
import { ProposalActionRolesService } from './proposal-actions/proposal-action-roles/proposal-action-roles.service';
import { ProposalActionsService } from './proposal-actions/proposal-actions.service';
import {
  MIN_GROUP_SIZE_TO_RATIFY,
  MIN_VOTE_COUNT_TO_RATIFY,
  ProposalActionType,
  ProposalStage,
} from './proposals.constants';
import {
  GROUP_RATIFICATION_THRESHOLD,
  GROUP_RESERVATIONS_LIMIT,
  GROUP_STAND_ASIDES_LIMIT,
} from '../groups/groups.constants';

type ProposalWithCommentCount = Proposal & { commentCount: number };

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private repository: Repository<Proposal>,

    @Inject(forwardRef(() => VotesService))
    private votesService: VotesService,

    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private proposalActionEventsService: ProposalActionEventsService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalActionsService: ProposalActionsService,
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
        new Error(`Could not load votes for proposal: ${id}`),
    );
    return mappedVotes;
  }

  async getProposalCommentCountBatch(proposalIds: number[]) {
    const proposals = (await this.repository
      .createQueryBuilder('proposal')
      .leftJoinAndSelect('proposal.comments', 'comment')
      .loadRelationCountAndMap('proposal.commentCount', 'proposal.comments')
      .select(['proposal.id'])
      .whereInIds(proposalIds)
      .getMany()) as ProposalWithCommentCount[];

    return proposalIds.map((id) => {
      const proposal = proposals.find(
        (proposal: Proposal) => proposal.id === id,
      );
      if (!proposal) {
        return new Error(`Could not load comment count for proposal: ${id}`);
      }
      return proposal.commentCount;
    });
  }

  async getProposalImagesBatch(proposalIds: number[]) {
    const images = await this.imagesService.getImages({
      proposalId: In(proposalIds),
    });
    const mappedImages = proposalIds.map(
      (id) =>
        images.filter((image: Image) => image.proposalId === id) ||
        new Error(`Could not load images for proposal: ${id}`),
    );
    return mappedImages;
  }

  async createProposal(
    {
      images,
      action: { groupCoverPhoto, role, event, ...action },
      ...proposalData
    }: CreateProposalInput,
    user: User,
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
          ImageTypes.CoverPhoto,
        );
      }
      if (role) {
        await this.proposalActionRolesService.createProposalActionRole(
          proposal.action.id,
          role,
        );
      }
      if (event) {
        await this.proposalActionEventsService.createProposalActionEvent(
          proposal.action.id,
          event,
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
    const proposalWithAction = await this.getProposal(id, ['action']);
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
      proposal.action.actionType === ProposalActionType.ChangeGroupCoverPhoto
    ) {
      await this.imagesService.deleteImage({
        proposalActionId: proposal.action.id,
      });
      await this.proposalActionsService.saveProposalActionImage(
        proposal.action.id,
        groupCoverPhoto,
        ImageTypes.CoverPhoto,
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
    await this.implementProposal(proposalId);
    await this.repository.update(proposalId, {
      stage: ProposalStage.Ratified,
    });
  }

  async implementProposal(proposalId: number) {
    const {
      action: { id, actionType, groupDescription, groupName },
      groupId,
    } = await this.getProposal(proposalId, ['action']);

    if (actionType === ProposalActionType.PlanGroupEvent) {
      await this.proposalActionsService.implementGroupEvent(id, groupId);
      return;
    }
    if (actionType === ProposalActionType.CreateGroupRole) {
      await this.proposalActionsService.implementCreateGroupRole(id, groupId);
      return;
    }
    if (actionType === ProposalActionType.ChangeGroupRole) {
      await this.proposalActionsService.implementChangeGroupRole(id);
      return;
    }
    if (actionType === ProposalActionType.ChangeGroupName) {
      await this.groupsService.updateGroup({ id: groupId, name: groupName });
      return;
    }
    if (actionType === ProposalActionType.ChangeGroupDescription) {
      await this.groupsService.updateGroup({
        description: groupDescription,
        id: groupId,
      });
      return;
    }
    if (actionType === ProposalActionType.ChangeGroupCoverPhoto) {
      await this.proposalActionsService.implementChangeGroupCoverPhoto(
        id,
        groupId,
      );
    }
  }

  async isProposalRatifiable(proposalId: number) {
    const proposal = await this.getProposal(proposalId, [
      'group.members',
      'votes',
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

    const ratificationThreshold = GROUP_RATIFICATION_THRESHOLD * 0.01;

    return this.hasConsensus(ratificationThreshold, members, votes);
  }

  async hasConsensus(
    ratificationThreshold: number,
    groupMembers: User[],
    votes: Vote[],
  ) {
    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);

    return (
      agreements.length >= groupMembers.length * ratificationThreshold &&
      reservations.length <= GROUP_RESERVATIONS_LIMIT &&
      standAsides.length <= GROUP_STAND_ASIDES_LIMIT &&
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
