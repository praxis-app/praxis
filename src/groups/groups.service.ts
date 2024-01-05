import { UserInputError } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import { paginate, sanitizeText } from '../common/common.utils';
import { ImageTypes } from '../images/image.constants';
import {
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { DecisionMakingModel } from '../proposals/proposals.constants';
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

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

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
    return offset !== undefined
      ? paginate(sortedFeed, offset, limit)
      : sortedFeed;
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
    const postsCount = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.posts', 'post')
      .where('group.id = :id', { id })
      .getCount();

    const proposalsCount = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.proposals', 'proposal')
      .where('group.id = :id', { id })
      .getCount();

    return postsCount + proposalsCount;
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

  async createGroup(
    { name, description, coverPhoto, ...groupData }: CreateGroupInput,
    userId: number,
  ) {
    const sanitizedDescription = sanitizeText(description.trim());
    const group = await this.groupRepository.save({
      description: sanitizedDescription,
      name: name.trim(),
      ...groupData,
    });
    await this.createGroupMember(group.id, userId);

    if (coverPhoto) {
      await this.saveGroupCoverPhoto(group.id, coverPhoto);
    } else {
      await this.saveDefaultGroupCoverPhoto(group.id);
    }
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
    const sanitizedDescription = description
      ? sanitizeText(description.trim())
      : undefined;
    await this.groupRepository.update(id, {
      description: sanitizedDescription,
      name: name?.trim(),
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

  async leaveGroup(id: number, userId: number) {
    const where = { group: { id }, userId };
    await this.deleteGroupMember(id, userId);
    await this.deleteGroupMemberRequest(where);
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

    await this.groupConfigRepository.update(group.config.id, groupConfigData);
    return { group };
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

  async createGroupMemberRequest(groupId: number, userId: number) {
    const groupMemberRequest = await this.groupMemberRequestRepository.save({
      groupId,
      userId,
    });
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

  async cancelGroupMemberRequest(id: number) {
    await this.deleteGroupMemberRequest({ id });
    return true;
  }

  async deleteGroupMemberRequest(where: FindOptionsWhere<GroupMemberRequest>) {
    await this.groupMemberRequestRepository.delete(where);
    return true;
  }
}
