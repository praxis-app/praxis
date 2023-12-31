import { UserInputError } from '@nestjs/apollo';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { paginate, sanitizeText } from '../common/common.utils';
import { MyGroupsKey } from '../dataloader/dataloader.types';
import { ImageTypes } from '../images/image.constants';
import {
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { UsersService } from '../users/users.service';
import { GroupPrivacy } from './group-configs/group-configs.constants';
import { GroupConfigsService } from './group-configs/group-configs.service';
import { GroupMemberRequestsService } from './group-member-requests/group-member-requests.service';
import { initGroupRolePermissions } from './group-roles/group-role.utils';
import { GroupRolesService } from './group-roles/group-roles.service';
import { GroupAdminModel } from './groups.constants';
import { CreateGroupInput } from './models/create-group.input';
import { Group } from './models/group.model';
import { UpdateGroupInput } from './models/update-group.input';

type GroupWithMemberCount = Group & { memberCount: number };

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @Inject(forwardRef(() => GroupMemberRequestsService))
    private memberRequestsService: GroupMemberRequestsService,

    private groupConfigsService: GroupConfigsService,
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

  async getPagedGroups(
    where?: FindOptionsWhere<Group>,
    offset?: number,
    limit?: number,
  ) {
    const groups = await this.getGroups(where);
    const sortedFeed = groups.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined ? paginate(sortedFeed, offset, limit) : sortedFeed;

    return { nodes, totalCount: sortedFeed.length };
  }

  async getGroupFeed(id: number, offset?: number, limit?: number) {
    const group = await this.getGroup({ id }, ['proposals', 'posts']);
    const sortedFeed = [...group.posts, ...group.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined ? paginate(sortedFeed, offset, limit) : sortedFeed;

    return { nodes, totalCount: sortedFeed.length };
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
    const config = await this.groupConfigsService.getGroupConfig({ groupId });
    return config.adminModel === GroupAdminModel.NoAdmin;
  }

  async getCoverPhotosBatch(groupIds: number[]) {
    const coverPhotos = await this.imageRepository.find({
      where: { groupId: In(groupIds), imageType: ImageTypes.CoverPhoto },
    });
    const mappedCoverPhotos = groupIds.map(
      (id) =>
        coverPhotos.find((coverPhoto: Image) => coverPhoto.groupId === id) ||
        new Error(`Could not load cover photo for group: ${id}`),
    );
    return mappedCoverPhotos;
  }

  async getGroupsBatch(groupIds: number[]) {
    const groups = await this.getGroups({
      id: In(groupIds),
    });
    return groupIds.map(
      (id) =>
        groups.find((group: Group) => group.id === id) ||
        new Error(`Could not load group: ${id}`),
    );
  }

  async getMyGroupPermissionsBatch(keys: MyGroupsKey[]) {
    const groupIds = keys.map(({ groupId }) => groupId);
    const { groupPermissions } = await this.usersService.getUserPermissions(
      keys[0].currentUserId,
    );
    return groupIds.map((id) => {
      if (!groupPermissions[id]) {
        return initGroupRolePermissions();
      }
      return groupPermissions[id];
    });
  }

  async isJoinedByMeBatch(keys: MyGroupsKey[]) {
    const groupIds = keys.map(({ groupId }) => groupId);
    const groups = await this.getGroups({ id: In(groupIds) }, ['members']);

    return groupIds.map((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        return new Error(`Could not load group: ${groupId}`);
      }
      return group.members.some(
        (member) => member.id === keys[0].currentUserId,
      );
    });
  }

  async getGroupMembersBatch(groupIds: number[]) {
    const groups = await this.getGroups({ id: In(groupIds) }, ['members']);

    return groupIds.map((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        return new Error(`Could not load group members: ${groupId}`);
      }
      return group.members;
    });
  }

  async getGroupMemberCountBatch(groupIds: number[]) {
    const groups = (await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.members', 'groupMember')
      .loadRelationCountAndMap('group.memberCount', 'group.members')
      .select(['group.id'])
      .whereInIds(groupIds)
      .getMany()) as GroupWithMemberCount[];

    return groupIds.map((id) => {
      const group = groups.find((group: Group) => group.id === id);
      if (!group) {
        return new Error(`Could not load group member count: ${id}`);
      }
      return group.memberCount;
    });
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
      await this.saveCoverPhoto(group.id, coverPhoto);
    } else {
      await this.saveDefaultCoverPhoto(group.id);
    }
    await this.groupConfigsService.initGroupConfig(group.id);
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
      await this.saveCoverPhoto(id, coverPhoto);
    }

    const group = await this.getGroup({ id });
    return { group };
  }

  async saveCoverPhoto(groupId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    await this.deleteCoverPhoto(groupId);

    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
  }

  async deleteGroup(id: number) {
    await this.deleteCoverPhoto(id);
    await this.groupRepository.delete(id);
    return true;
  }

  async deleteCoverPhoto(groupId: number) {
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
    await this.memberRequestsService.deleteGroupMemberRequest(where);
    return true;
  }

  async saveDefaultCoverPhoto(groupId: number) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
  }
}
