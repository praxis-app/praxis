import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { ConversationMember } from '../chat/models/conversation-member.model';
import { Conversation } from '../chat/models/conversation.model';
import { VALID_NAME_REGEX } from '../common/common.constants';
import { paginate, sanitizeText } from '../common/common.utils';
import { ImageTypes } from '../images/image.constants';
import {
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { DecisionMakingModel } from '../proposals/proposals.constants';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { GroupRolesService } from './group-roles/group-roles.service';
import { GroupAdminModel, GroupPrivacy } from './groups.constants';
import { CreateGroupInput } from './models/create-group.input';
import { GroupConfig } from './models/group-config.model';
import {
  GroupMemberRequest,
  GroupMemberRequestStatus,
} from './models/group-member-request.model';
import { Group } from './models/group.model';
import { UpdateGroupConfigInput } from './models/update-group-config.input';
import { UpdateGroupInput } from './models/update-group.input';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @InjectRepository(GroupConfig)
    private groupConfigRepository: Repository<GroupConfig>,

    @InjectRepository(GroupMemberRequest)
    private groupMemberRequestRepository: Repository<GroupMemberRequest>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationMember)
    private conversationMemberRepository: Repository<ConversationMember>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private notificationsService: NotificationsService,
    private groupRolesService: GroupRolesService,
    private usersService: UsersService,
  ) {}

  async getGroup(where: FindOptionsWhere<Group>, relations?: string[]) {
    return this.groupRepository.findOneOrFail({ where, relations });
  }

  async getGroups(where?: FindOptionsWhere<Group>, relations?: string[]) {
    return this.groupRepository.find({
      order: { updatedAt: 'DESC' },
      relations,
      where,
    });
  }

  async getGroupsCount(where?: FindOptionsWhere<Group>) {
    return this.groupRepository.count({ where });
  }

  async getPagedGroups(
    where?: FindOptionsWhere<Group>,
    offset?: number,
    limit?: number,
  ) {
    const groups = await this.getGroups(where);
    const sortedFeed = groups.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    if (typeof offset !== 'number') {
      return sortedFeed;
    }
    return paginate(sortedFeed, offset, limit);
  }

  async getGroupFeed(id: number, offset?: number, limit?: number) {
    const group = await this.getGroup({ id }, ['proposals', 'posts']);
    const sortedFeed = [...group.posts, ...group.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedFeed, offset, limit)
      : sortedFeed;
  }

  async getGroupFeedItemCount(id: number) {
    const postsCount = await this.postRepository.count({
      where: { groupId: id },
    });
    const proposalsCount = await this.proposalRepository.count({
      where: { groupId: id },
    });
    return postsCount + proposalsCount;
  }

  async getJoinedGroupsFeed(userId: number, offset?: number, limit?: number) {
    const groups = await this.getGroups({ members: { id: userId } }, [
      'posts',
      'proposals',
      'events.posts',
    ]);
    const [posts, proposals] = groups.reduce<[Post[], Proposal[]]>(
      (result, { posts, proposals, events }) => {
        const eventPosts = events.reduce<Post[]>(
          (res, { posts }) => [...res, ...posts],
          [],
        );
        result[0].push(...posts, ...eventPosts);
        result[1].push(...proposals);
        return result;
      },
      [[], []],
    );
    const sortedFeed = [...posts, ...proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedFeed, offset, limit)
      : sortedFeed;
  }

  async getJoinedGroupsFeedCount(userId: number) {
    const postsCount = await this.postRepository.count({
      where: { group: { members: { id: userId } } },
    });
    const eventPostsCount = await this.postRepository.count({
      where: {
        event: { group: { members: { id: userId } } },
      },
    });
    const proposalsCount = await this.proposalRepository.count({
      where: { group: { members: { id: userId } } },
    });
    return postsCount + eventPostsCount + proposalsCount;
  }

  async getPublicGroupsFeed(offset?: number, limit?: number) {
    const publicGroups = await this.getGroups(
      { config: { privacy: GroupPrivacy.Public } },
      ['posts', 'proposals', 'events.posts'],
    );
    const [posts, proposals] = publicGroups.reduce<[Post[], Proposal[]]>(
      (result, { posts, proposals, events }) => {
        const eventPosts = events.reduce<Post[]>(
          (res, { posts }) => [...res, ...posts],
          [],
        );
        result[0].push(...posts, ...eventPosts);
        result[1].push(...proposals);
        return result;
      },
      [[], []],
    );

    const sortedFeed = [...posts, ...proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined ? paginate(sortedFeed, offset, limit) : sortedFeed;

    return { nodes, totalCount: sortedFeed.length };
  }

  async isGroupMember(groupId: number, userId: number) {
    const group = await this.getGroup(
      {
        id: groupId,
        members: { id: userId },
      },
      ['members'],
    );
    return !!group.members.length;
  }

  async isPublicGroupImage(imageId: number) {
    const image = await this.imageRepository.findOneOrFail({
      where: { id: imageId },
      relations: ['group.config'],
    });
    return image.group?.config.privacy === GroupPrivacy.Public;
  }

  async isNoAdminGroup(groupId: number) {
    const config = await this.getGroupConfig({ groupId });
    return config.adminModel === GroupAdminModel.NoAdmin;
  }

  async getGroupChat(groupId: number) {
    const chat = await this.conversationRepository.findOne({
      where: { groupId },
    });
    if (!chat) {
      return this.initGroupChat(groupId);
    }
    return chat;
  }

  async initGroupChat(groupId: number) {
    const group = await this.getGroup({ id: groupId }, ['members']);
    const chatMembers = group.members.map(({ id }) => ({ userId: id }));
    const groupChat: Conversation = await this.conversationRepository.save({
      name: `${group.name} chat`,
      members: chatMembers,
      groupId,
    });
    return groupChat;
  }

  async syncGroupChatMembers(groupId: number) {
    const vibeChat = await this.getGroupChat(groupId);
    const chatMembers = await this.userRepository.find({
      where: {
        conversationMembers: {
          conversation: { groupId },
        },
      },
    });
    const { members: groupMembers } = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['members'],
      select: ['members'],
    });

    const chatMemberIds = chatMembers.map(({ id }) => id);
    const groupMemberIds = groupMembers.map(({ id }) => id);
    const membersToAdd = groupMemberIds.filter(
      (id) => !chatMemberIds.includes(id),
    );
    const membersToRemove = chatMemberIds.filter(
      (id) => !groupMemberIds.includes(id),
    );

    if (membersToAdd.length) {
      await this.conversationMemberRepository.save(
        membersToAdd.map((userId) => ({
          conversationId: vibeChat.id,
          userId,
        })),
      );
    }
    if (membersToRemove.length) {
      await this.conversationMemberRepository.delete({
        conversationId: vibeChat.id,
        userId: In(membersToRemove),
      });
    }
  }

  async createGroup(
    { name, description, coverPhoto, ...groupData }: CreateGroupInput,
    userId: number,
  ) {
    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = sanitizeText(description);
    const isValidName = VALID_NAME_REGEX.test(name || '');

    if (!isValidName) {
      throw new Error('Group names cannot contain special characters');
    }
    if (sanitizedName.length < 5) {
      throw new Error('Group name must be at least 5 characters');
    }
    if (sanitizedName.length > 25) {
      throw new Error('Group name cannot exceed 25 characters');
    }
    if (sanitizedDescription.length > 1000) {
      throw new Error('Group description cannot exceed 1000 characters');
    }

    const group = await this.groupRepository.save({
      description: sanitizedDescription,
      name: sanitizedName,
      ...groupData,
    });
    await this.createGroupMember(group.id, userId);

    if (coverPhoto) {
      await this.saveGroupCoverPhoto(group.id, coverPhoto);
    } else {
      await this.saveDefaultGroupCoverPhoto(group.id);
    }
    await this.initGroupChat(group.id);
    await this.initGroupConfig(group.id);
    await this.groupRolesService.initGroupAdminRole(userId, group.id);

    return { group };
  }

  async updateGroup({
    id,
    name,
    description,
    coverPhoto,
    ...groupData
  }: UpdateGroupInput) {
    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = sanitizeText(description);
    const isValidName = VALID_NAME_REGEX.test(name || '');

    if (name && !isValidName) {
      throw new Error('Group names cannot contain special characters');
    }
    if (!isValidName) {
      throw new Error('Group names cannot contain special characters');
    }
    if (name && sanitizedName.length < 5) {
      throw new Error('Group name must be at least 5 characters');
    }
    if (name && sanitizedName.length > 25) {
      throw new Error('Group name cannot exceed 25 characters');
    }
    if (description && sanitizedDescription.length > 1000) {
      throw new Error('Group description cannot exceed 1000 characters');
    }

    await this.groupRepository.update(id, {
      description: sanitizedDescription,
      name: sanitizedName,
      ...groupData,
    });

    if (coverPhoto) {
      await this.saveGroupCoverPhoto(id, coverPhoto);
    }

    const group = await this.getGroup({ id });
    return { group };
  }

  async saveGroupCoverPhoto(groupId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    await this.deleteGroupCoverPhoto(groupId);

    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
  }

  async deleteGroup(id: number) {
    await this.deleteGroupCoverPhoto(id);
    await this.groupRepository.delete(id);
    return true;
  }

  async deleteGroupCoverPhoto(groupId: number) {
    const image = await this.imageRepository.findOne({
      where: { imageType: ImageTypes.CoverPhoto, groupId },
    });
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.imageRepository.delete({ imageType: ImageTypes.CoverPhoto, groupId });
    return true;
  }

  async createGroupMember(groupId: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    const group = await this.getGroup({ id: groupId }, ['members']);
    if (!user || !group) {
      throw new UserInputError('User or group not found');
    }
    await this.groupRepository.save({
      ...group,
      members: [...group.members, user],
    });
    return user;
  }

  async deleteGroupMember(id: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    const group = await this.getGroup({ id }, ['members']);
    if (!user || !group) {
      throw new UserInputError('User or group not found');
    }
    group.members = group.members.filter((member) => member.id !== userId);
    await this.groupRepository.save(group);
    return true;
  }

  async leaveGroup(groupId: number, userId: number) {
    await this.deleteGroupMember(groupId, userId);
    await this.deleteGroupMemberRequest({ group: { id: groupId }, userId });
    await this.groupRolesService.removeMemberFromAllGroupRoles(groupId, userId);
    await this.syncGroupChatMembers(groupId);
    return true;
  }

  async saveDefaultGroupCoverPhoto(groupId: number) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
  }

  async getGroupConfig(where: FindOptionsWhere<GroupConfig>) {
    return this.groupConfigRepository.findOneOrFail({ where });
  }

  async isPublicGroup(id: number) {
    const groupConfig = await this.getGroupConfig({ id });
    return groupConfig.privacy === GroupPrivacy.Public;
  }

  // TODO: Rename as `createGroupConfig`
  async initGroupConfig(groupId: number) {
    return this.groupConfigRepository.save({ groupId });
  }

  async updateGroupConfig({
    groupId,
    ...groupConfigData
  }: UpdateGroupConfigInput) {
    const group = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['config'],
    });
    const newConfig = { ...group.config, ...groupConfigData };
    if (
      newConfig.decisionMakingModel === DecisionMakingModel.Consent &&
      newConfig.votingTimeLimit === 0
    ) {
      throw new Error(
        'Voting time limit is required for consent decision making model',
      );
    }
    if (
      newConfig.decisionMakingModel === DecisionMakingModel.MajorityVote &&
      newConfig.ratificationThreshold <= 50
    ) {
      throw new Error(
        'Ratification threshold must be greater than 50% for majority vote',
      );
    }
    if (newConfig.adminModel === GroupAdminModel.Rotating) {
      throw new Error('Rotating admin model is not supported yet');
    }

    await this.groupConfigRepository.update(group.config.id, groupConfigData);
    return { group };
  }

  async getGroupMembers(groupId: number) {
    const { members } = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['members'],
      select: ['members'],
    });
    return members;
  }

  async getGroupMemberRequest(
    where: FindOptionsWhere<GroupMemberRequest>,
    relations?: string[],
  ) {
    return this.groupMemberRequestRepository.findOne({
      relations,
      where,
    });
  }

  async getGroupMemberRequests(groupId: number) {
    return this.groupMemberRequestRepository.find({
      where: { status: GroupMemberRequestStatus.Pending, groupId },
      order: { createdAt: 'DESC' },
    });
  }

  async getMembersWithApprovalPermission(groupId: number) {
    return this.usersService.getUsers({
      groupRoles: {
        permission: { approveMemberRequests: true },
        groupId,
      },
    });
  }

  async createGroupMemberRequest(groupId: number, userId: number) {
    const groupMemberRequest = await this.groupMemberRequestRepository.save({
      groupId,
      userId,
    });
    const members = await this.getMembersWithApprovalPermission(groupId);
    for (const member of members) {
      await this.notificationsService.createNotification({
        notificationType: NotificationType.GroupMemberRequest,
        groupId: groupMemberRequest.groupId,
        otherUserId: userId,
        userId: member.id,
      });
    }
    return { groupMemberRequest };
  }

  async approveGroupMemberRequest(id: number) {
    const memberRequest = await this.updateGroupMemberRequest(id, {
      status: GroupMemberRequestStatus.Approved,
    });
    const groupMember = await this.createGroupMember(
      memberRequest.groupId,
      memberRequest.userId,
    );

    // Add new member to group chat
    await this.syncGroupChatMembers(memberRequest.groupId);

    // Notify new member that their request was approved
    await this.notificationsService.createNotification({
      notificationType: NotificationType.GroupMemberRequestApproval,
      groupId: memberRequest.groupId,
      userId: memberRequest.userId,
    });

    return { groupMember };
  }

  async denyGroupMemberRequest(id: number) {
    await this.updateGroupMemberRequest(id, {
      status: GroupMemberRequestStatus.Denied,
    });
    return true;
  }

  async updateGroupMemberRequest(
    id: number,
    requestData: Partial<GroupMemberRequest>,
  ) {
    await this.groupMemberRequestRepository.update(id, requestData);
    return this.groupMemberRequestRepository.findOneOrFail({ where: { id } });
  }

  async cancelGroupMemberRequest(id: number, userId: number) {
    const groupMemberRequest = await this.getGroupMemberRequest({ id });
    if (!groupMemberRequest) {
      throw new UserInputError('Group member request not found');
    }
    await this.deleteGroupMemberRequest({ id });
    await this.notificationsService.deleteNotifications({
      notificationType: NotificationType.GroupMemberRequest,
      groupId: groupMemberRequest.groupId,
      otherUserId: userId,
    });
    return true;
  }

  async deleteGroupMemberRequest(where: FindOptionsWhere<GroupMemberRequest>) {
    await this.groupMemberRequestRepository.delete(where);
    return true;
  }
}
