/**
 * TODO: Add support for implementing remaining action types
 * TODO: Add support for other voting models
 */

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { GroupPrivacy } from '../groups/group-configs/group-configs.constants';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../groups/models/group.model';
import { ImageTypes } from '../images/image.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/models/image.model';
import { logTime, sanitizeText } from '../shared/shared.utils';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { VotesService } from '../votes/votes.service';
import { sortConsensusVotesByType } from '../votes/votes.utils';
import { CreateProposalInput } from './models/create-proposal.input';
import { Proposal } from './models/proposal.model';
import { UpdateProposalInput } from './models/update-proposal.input';
import { ProposalActionEventsService } from './proposal-actions/proposal-action-events/proposal-action-events.service';
import { ProposalActionGroupConfigsService } from './proposal-actions/proposal-action-group-configs/proposal-action-group-configs.service';
import { ProposalActionRolesService } from './proposal-actions/proposal-action-roles/proposal-action-roles.service';
import { ProposalActionsService } from './proposal-actions/proposal-actions.service';
import {
  DecisionMakingModel,
  MinGroupSizeToRatify,
  ProposalActionType,
  ProposalStage,
} from './proposals.constants';

type ProposalWithCommentCount = Proposal & { commentCount: number };

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    @InjectRepository(Proposal)
    private repository: Repository<Proposal>,

    @Inject(forwardRef(() => VotesService))
    private votesService: VotesService,

    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,

    @Inject('PUB_SUB') private pubSub: PubSub,

    private groupsService: GroupsService,
    private proposalActionEventsService: ProposalActionEventsService,
    private proposalActionGroupConfigsService: ProposalActionGroupConfigsService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalActionsService: ProposalActionsService,
  ) {}

  async getProposal(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getProposals(where?: FindOptionsWhere<Proposal>, relations?: string[]) {
    return this.repository.find({ where, relations });
  }

  async isPublicProposalImage(image: Image) {
    if (image?.proposalActionId) {
      const proposalAction =
        await this.proposalActionsService.getProposalAction(
          { id: image.proposalActionId },
          ['proposal.group.config'],
        );
      return (
        proposalAction?.proposal.group.config.privacy === GroupPrivacy.Public
      );
    }
    if (!image.proposalId) {
      return false;
    }
    const { group } = await this.getProposal(image.proposalId, [
      'group.config',
    ]);
    return group.config.privacy === GroupPrivacy.Public;
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
      body,
      images,
      action: { groupCoverPhoto, role, event, groupSettings, ...action },
      ...proposalData
    }: CreateProposalInput,
    user: User,
  ) {
    const sanitizedBody = body ? sanitizeText(body.trim()) : undefined;
    const proposal = await this.repository.save({
      ...proposalData,
      body: sanitizedBody,
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
      if (groupSettings) {
        await this.proposalActionGroupConfigsService.createProposalActionGroupConfig(
          proposal.action.id,
          groupSettings,
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
    body,
    images,
    action: { groupCoverPhoto, ...action },
    ...data
  }: UpdateProposalInput) {
    const sanitizedBody = body ? sanitizeText(body.trim()) : undefined;
    const proposalWithAction = await this.getProposal(id, ['action']);
    const newAction = {
      ...proposalWithAction.action,
      ...action,
    };
    const proposal = await this.repository.save({
      ...proposalWithAction,
      ...data,
      action: newAction,
      body: sanitizedBody,
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
    if (actionType === ProposalActionType.ChangeGroupSettings) {
      await this.proposalActionsService.implementChangeGroupConfig(id, groupId);
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
    const { votes, stage, group, createdAt } = await this.getProposal(
      proposalId,
      ['group.config', 'group.members', 'votes'],
    );
    if (stage !== ProposalStage.Voting) {
      return false;
    }
    if (group.config.decisionMakingModel === DecisionMakingModel.Consensus) {
      return this.hasConsensus(votes, group);
    }
    if (group.config.decisionMakingModel === DecisionMakingModel.Consent) {
      return this.hasConsent(votes, group, createdAt);
    }
    return false;
  }

  async hasConsensus(votes: Vote[], { members, config }: Group) {
    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);
    const { reservationsLimit, standAsidesLimit, ratificationThreshold } =
      config;

    return (
      members.length >= MinGroupSizeToRatify.Consensus &&
      agreements.length >= members.length * (ratificationThreshold * 0.01) &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
    );
  }

  async hasConsent(
    votes: Vote[],
    { members, config }: Group,
    proposalCreatedAt: Date,
  ) {
    const { reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);
    const { reservationsLimit, standAsidesLimit, votingTimeLimit } = config;

    const minutesPassedSinceProposalCreation = Math.floor(
      (new Date().getTime() - proposalCreatedAt.getTime()) / 60000,
    );

    return (
      members.length >= MinGroupSizeToRatify.Consent &&
      minutesPassedSinceProposalCreation >= votingTimeLimit &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
    );
  }

  async synchronizeProposals() {
    const logTimeMessage = 'Syncronizing proposals';
    logTime(logTimeMessage, this.logger);

    const proposals = await this.getProposals({ stage: ProposalStage.Voting }, [
      'group.config',
    ]);

    for (const proposal of proposals) {
      await this.synchronizeProposal(proposal);
    }
    logTime(logTimeMessage, this.logger);
  }

  async synchronizeProposal(proposal: Proposal) {
    if (
      proposal.group.config.decisionMakingModel !== DecisionMakingModel.Consent
    ) {
      return proposal;
    }
    const hasVotingPeriodEnded = this.hasVotingPeriodEnded(
      proposal.group.config.votingTimeLimit,
      proposal.createdAt,
    );

    if (hasVotingPeriodEnded) {
      const isRatifiable = await this.isProposalRatifiable(proposal.id);

      if (isRatifiable) {
        await this.ratifyProposal(proposal.id);
        await this.implementProposal(proposal.id);

        this.pubSub.publish(`isProposalRatified-${proposal.id}`, {
          isProposalRatified: true,
        });

        return { ...proposal, stage: ProposalStage.Ratified };
      }
    }
    return proposal;
  }

  async synchronizeProposalById(id: number) {
    const proposal = await this.getProposal(id, ['group.config']);
    const syncedProposal = await this.synchronizeProposal(proposal);
    return { proposal: syncedProposal };
  }

  hasVotingPeriodEnded(votingTimeLimit: number, createdAt: Date) {
    const timeOfCreation = createdAt.getTime();
    const now = new Date().getTime();
    const oneMinute = 60 * 1000;

    const minutesPassedSinceProposalCreation = Math.floor(
      (now - timeOfCreation) / oneMinute,
    );

    return minutesPassedSinceProposalCreation >= votingTimeLimit;
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
