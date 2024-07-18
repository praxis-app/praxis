import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { PageSize } from '../common/common.constants';
import { logTime, sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { GroupsService } from '../groups/groups.service';
import { ImageTypes } from '../images/image.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { ServerConfig } from '../server-configs/models/server-config.model';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import {
  sortConsensusVotesByType,
  sortMajorityVotesByType,
} from '../votes/votes.utils';
import { CreateProposalInput } from './models/create-proposal.input';
import { ProposalConfig } from './models/proposal-config.model';
import { Proposal } from './models/proposal.model';
import { UpdateProposalInput } from './models/update-proposal.input';
import { ProposalActionsService } from './proposal-actions/proposal-actions.service';
import {
  DecisionMakingModel,
  ProposalActionType,
  ProposalStage,
} from './proposals.constants';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);

  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    @InjectRepository(ProposalConfig)
    private proposalConfigRepository: Repository<ProposalConfig>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(ServerConfig)
    private serverConfigRepository: Repository<ServerConfig>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private groupsService: GroupsService,
    private notificationsService: NotificationsService,
    private proposalActionsService: ProposalActionsService,
  ) {}

  async getProposal(id: number, relations?: string[]) {
    return this.proposalRepository.findOneOrFail({ where: { id }, relations });
  }

  async getProposals(where?: FindOptionsWhere<Proposal>, relations?: string[]) {
    return this.proposalRepository.find({ where, relations });
  }

  async isPublicProposalImage(image: Image) {
    if (image?.proposalActionId) {
      const proposalAction =
        await this.proposalActionsService.getProposalAction(
          { id: image.proposalActionId },
          ['proposal.group.config'],
        );
      return (
        proposalAction?.proposal.group?.config.privacy === GroupPrivacy.Public
      );
    }
    if (!image.proposalId) {
      return false;
    }
    const { group } = await this.getProposal(image.proposalId, [
      'group.config',
    ]);
    return group?.config.privacy === GroupPrivacy.Public;
  }

  async getProposalConfig(proposalId: number) {
    return this.proposalConfigRepository.findOneOrFail({
      where: { proposalId },
    });
  }

  async getConfigForNewProposal(groupId?: number) {
    if (groupId) {
      const { config } = await this.groupsService.getGroup({ id: groupId }, [
        'config',
      ]);
      return config;
    }
    return this.getServerConfig();
  }

  async getProposalComments(proposalId: number) {
    const { comments } = await this.getProposal(proposalId, ['comments']);

    // TODO: Update once pagination has been implemented
    return comments.slice(
      comments.length - Math.min(comments.length, PageSize.Large),
      comments.length,
    );
  }

  async getProposalVote(proposalId: number, userId: number) {
    return this.voteRepository.findOne({ where: { proposalId, userId } });
  }

  async getRatifiedProposalCount() {
    return this.proposalRepository.count({
      where: { stage: ProposalStage.Ratified },
    });
  }

  async isOwnProposal(proposalId: number, userId: number) {
    const count = await this.proposalRepository.count({
      where: { id: proposalId, userId },
    });
    return count > 0;
  }

  async hasNoVotes(proposalId: number) {
    const votes = await this.voteRepository.find({ where: { proposalId } });
    return votes.length === 0;
  }

  async getProposalShares(proposalId: number) {
    const { shares } = await this.getProposal(proposalId, ['shares']);

    // TODO: Replace with pagination
    return shares.slice(
      shares.length - Math.min(shares.length, PageSize.Large),
      shares.length,
    );
  }

  async getServerConfig() {
    const serverConfigs = await this.serverConfigRepository.find();
    if (!serverConfigs.length) {
      return this.serverConfigRepository.save({});
    }
    return serverConfigs[0];
  }

  async createProposal(
    {
      body,
      images,
      closingAt,
      action: { groupCoverPhoto, role, event, groupSettings, ...action },
      ...proposalData
    }: CreateProposalInput,
    user: User,
  ) {
    const sanitizedBody = sanitizeText(body);
    if (body && body.length > 8000) {
      throw new Error('Proposals must be 8000 characters or less');
    }

    const config = await this.getConfigForNewProposal(proposalData.groupId);
    const configClosingAt = config.votingTimeLimit
      ? new Date(Date.now() + config.votingTimeLimit * 60 * 1000)
      : undefined;

    const proposalConfig: Partial<ProposalConfig> = {
      decisionMakingModel: config.decisionMakingModel,
      ratificationThreshold: config.ratificationThreshold,
      reservationsLimit: config.reservationsLimit,
      standAsidesLimit: config.standAsidesLimit,
      closingAt: closingAt || configClosingAt,
    };

    const proposal = await this.proposalRepository.save({
      ...proposalData,
      body: sanitizedBody,
      config: proposalConfig,
      userId: user.id,
      action,
    });

    try {
      if (groupCoverPhoto) {
        await this.proposalActionsService.saveProposalActionImage(
          proposal.action.id,
          groupCoverPhoto,
          ImageTypes.CoverPhoto,
        );
      }
      if (images) {
        await this.saveProposalImages(proposal.id, images);
      }
      if (role) {
        await this.proposalActionsService.createProposalActionRole(
          proposal.action.id,
          role,
        );
      }
      if (event) {
        await this.proposalActionsService.createProposalActionEvent(
          proposal.action.id,
          event,
        );
      }
      if (groupSettings) {
        await this.proposalActionsService.createProposalActionGroupConfig(
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
    const sanitizedBody = sanitizeText(body);
    if (body && body.length > 8000) {
      throw new Error('Proposals must be 8000 characters or less');
    }

    const proposalWithAction = await this.getProposal(id, ['action']);
    const newAction = {
      ...proposalWithAction.action,
      ...action,
    };
    const proposal = await this.proposalRepository.save({
      ...proposalWithAction,
      ...data,
      action: newAction,
      body: sanitizedBody,
    });

    if (
      groupCoverPhoto &&
      proposal.action.actionType === ProposalActionType.ChangeCoverPhoto
    ) {
      await this.proposalActionsService.deleteProposalActionImage(
        proposal.action.id,
      );
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
      await this.imageRepository.save({ filename, proposalId });
    }
  }

  async ratifyProposal(proposalId: number) {
    await this.proposalRepository.update(proposalId, {
      stage: ProposalStage.Ratified,
    });
    await this.pubSub.publish(`isProposalRatified-${proposalId}`, {
      isProposalRatified: true,
    });

    const proposal = await this.getProposal(proposalId);
    await this.notificationsService.createNotification({
      notificationType: NotificationType.ProposalRatification,
      groupId: proposal.groupId,
      userId: proposal.userId,
      proposalId,
    });
  }

  async closeProposal(proposalId: number) {
    await this.proposalRepository.update(proposalId, {
      stage: ProposalStage.Closed,
    });
  }

  async getProposalMembers(groupId: number | null) {
    if (groupId) {
      return this.groupsService.getGroupMembers(groupId);
    }
    return this.userRepository.find({
      where: { verified: true },
    });
  }

  async implementProposal(proposalId: number) {
    const {
      action: { id, actionType, groupDescription, groupName },
      groupId,
    } = await this.getProposal(proposalId, ['action']);

    if (!groupId) {
      if (actionType === ProposalActionType.ChangeRole) {
        await this.proposalActionsService.implementChangeServerRole(id);
      }
      if (actionType === ProposalActionType.CreateRole) {
        await this.proposalActionsService.implementCreateServerRole(id);
      }
      return;
    }

    if (actionType === ProposalActionType.PlanEvent) {
      await this.proposalActionsService.implementGroupEvent(id, groupId);
      return;
    }
    if (actionType === ProposalActionType.CreateRole) {
      await this.proposalActionsService.implementCreateGroupRole(id, groupId);
      return;
    }
    if (actionType === ProposalActionType.ChangeRole) {
      await this.proposalActionsService.implementChangeGroupRole(id);
      return;
    }
    if (actionType === ProposalActionType.ChangeSettings) {
      await this.proposalActionsService.implementChangeGroupConfig(id, groupId);
      return;
    }
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
      await this.proposalActionsService.implementChangeGroupCoverPhoto(
        id,
        groupId,
      );
    }
  }

  async isProposalRatifiable(proposalId: number) {
    const { votes, stage, config, groupId } = await this.getProposal(
      proposalId,
      ['config', 'votes'],
    );
    const members = await this.getProposalMembers(groupId);

    if (stage !== ProposalStage.Voting) {
      return false;
    }
    if (config.decisionMakingModel === DecisionMakingModel.Consensus) {
      return this.hasConsensus(votes, config, members);
    }
    if (config.decisionMakingModel === DecisionMakingModel.Consent) {
      return this.hasConsent(votes, config);
    }
    if (config.decisionMakingModel === DecisionMakingModel.MajorityVote) {
      return this.hasMajorityVote(votes, config, members);
    }
    return false;
  }

  async hasConsensus(
    votes: Vote[],
    {
      ratificationThreshold,
      reservationsLimit,
      standAsidesLimit,
      closingAt,
    }: ProposalConfig,
    groupMembers: User[],
  ) {
    if (closingAt && Date.now() < Number(closingAt)) {
      return false;
    }

    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);

    return (
      agreements.length >=
        groupMembers.length * (ratificationThreshold * 0.01) &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
    );
  }

  async hasConsent(votes: Vote[], proposalConfig: ProposalConfig) {
    const { reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);
    const { reservationsLimit, standAsidesLimit, closingAt } = proposalConfig;

    return (
      Date.now() >= Number(closingAt) &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
    );
  }

  async hasMajorityVote(
    votes: Vote[],
    { ratificationThreshold, closingAt }: ProposalConfig,
    groupMembers: User[],
  ) {
    if (closingAt && Date.now() < Number(closingAt)) {
      return false;
    }
    const { agreements } = sortMajorityVotesByType(votes);

    return (
      agreements.length >= groupMembers.length * (ratificationThreshold * 0.01)
    );
  }

  async synchronizeProposals() {
    const logTimeMessage = 'Syncronizing proposals';
    logTime(logTimeMessage, this.logger);

    const proposals = await this.getProposals(
      {
        config: { closingAt: Not(IsNull()) },
        stage: ProposalStage.Voting,
      },
      ['config'],
    );

    for (const proposal of proposals) {
      await this.synchronizeProposal(proposal);
    }

    logTime(logTimeMessage, this.logger);
  }

  async synchronizeProposal(proposal: Proposal) {
    const { id, config } = proposal;
    if (!config.closingAt || Date.now() < Number(config.closingAt)) {
      return proposal;
    }

    const isRatifiable = await this.isProposalRatifiable(id);

    if (!isRatifiable) {
      await this.closeProposal(proposal.id);
      return { ...proposal, stage: ProposalStage.Closed };
    }

    await this.ratifyProposal(id);
    await this.implementProposal(id);

    return { ...proposal, stage: ProposalStage.Ratified };
  }

  async synchronizeProposalById(id: number) {
    const proposal = await this.getProposal(id, ['config']);
    const syncedProposal = await this.synchronizeProposal(proposal);
    return { proposal: syncedProposal };
  }

  async deleteProposal(proposalId: number) {
    const images = await this.imageRepository.find({ where: { proposalId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.proposalRepository.delete(proposalId);
    return true;
  }
}
