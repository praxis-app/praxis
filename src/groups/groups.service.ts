import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { DEFAULT_PAGE_SIZE } from "../common/common.constants";
import { MyGroupsKey } from "../dataloader/dataloader.types";
import { randomDefaultImagePath, saveImage } from "../images/image.utils";
import { ImagesService, ImageTypes } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { RolesService } from "../roles/roles.service";
import { UsersService } from "../users/users.service";
import { MemberRequestsService } from "./member-requests/member-requests.service";
import { CreateGroupInput } from "./models/create-group.input";
import { Group } from "./models/group.model";
import { UpdateGroupInput } from "./models/update-group.input";

type GroupWithMemberCount = Group & { memberCount: number };

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @Inject(forwardRef(() => MemberRequestsService))
    private memberRequestsService: MemberRequestsService,

    private imagesService: ImagesService,
    private rolesService: RolesService,
    private usersService: UsersService
  ) {}

  async getGroup(where: FindOptionsWhere<Group>, relations?: string[]) {
    return this.groupRepository.findOneOrFail({ where, relations });
  }

  async getGroups(where?: FindOptionsWhere<Group>, relations?: string[]) {
    return this.groupRepository.find({
      order: { updatedAt: "DESC" },
      relations,
      where,
    });
  }

  async getGroupFeed(id: number) {
    const group = await this.getGroup({ id }, ["proposals", "posts"]);
    const sortedFeed = [...group.posts, ...group.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // TODO: Update once pagination has been implemented
    return sortedFeed.slice(0, DEFAULT_PAGE_SIZE);
  }

  async isJoinedByUser(id: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId }, ["groups"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    return user.groups.some((group) => group.id === id);
  }

  async getCoverPhotosByBatch(groupIds: number[]) {
    const coverPhotos = await this.imagesService.getImages({
      groupId: In(groupIds),
      imageType: ImageTypes.CoverPhoto,
    });
    const mappedCoverPhotos = groupIds.map(
      (id) =>
        coverPhotos.find((coverPhoto: Image) => coverPhoto.groupId === id) ||
        new Error(`Could not load cover photo for group: ${id}`)
    );
    return mappedCoverPhotos;
  }

  async getGroupsByBatch(groupIds: number[]) {
    const groups = await this.getGroups({
      id: In(groupIds),
    });
    return groupIds.map(
      (id) =>
        groups.find((group: Group) => group.id === id) ||
        new Error(`Could not load group: ${id}`)
    );
  }

  async getMyGroupPermissionsByBatch(keys: MyGroupsKey[]) {
    const groupIds = keys.map(({ groupId }) => groupId);
    const { groupPermissions } = await this.usersService.getUserPermissions(
      keys[0].currentUserId
    );
    return groupIds.map((id) => {
      if (!groupPermissions[id]) {
        return [];
      }
      return Array.from(groupPermissions[id]);
    });
  }

  async isJoinedByMeByBatch(keys: MyGroupsKey[]) {
    const groupIds = keys.map(({ groupId }) => groupId);
    const groups = await this.getGroups({ id: In(groupIds) }, ["members"]);

    return groupIds.map((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        return new Error(`Could not load group: ${groupId}`);
      }
      return group.members.some(
        (member) => member.id === keys[0].currentUserId
      );
    });
  }

  async getGroupMembersByBatch(groupIds: number[]) {
    const groups = await this.getGroups({ id: In(groupIds) }, ["members"]);

    return groupIds.map((groupId) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        return new Error(`Could not load group members: ${groupId}`);
      }
      return group.members;
    });
  }

  async getGroupMemberCountByBatch(groupIds: number[]) {
    const groups = (await this.groupRepository
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.members", "groupMember")
      .loadRelationCountAndMap("group.memberCount", "group.members")
      .select(["group.id"])
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
    { coverPhoto, ...groupData }: CreateGroupInput,
    userId: number
  ) {
    const group = await this.groupRepository.save(groupData);
    await this.createGroupMember(group.id, userId);

    if (coverPhoto) {
      await this.saveCoverPhoto(group.id, coverPhoto);
    } else {
      await this.saveDefaultCoverPhoto(group.id);
    }
    await this.rolesService.initAdminRole(userId, group.id);

    return { group };
  }

  async updateGroup({ id, coverPhoto, ...groupData }: UpdateGroupInput) {
    await this.groupRepository.update(id, groupData);
    const group = await this.getGroup({ id });

    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }

    return { group };
  }

  async saveCoverPhoto(groupId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    await this.deleteCoverPhoto(groupId);

    return this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
  }

  async saveDefaultCoverPhoto(groupId: number) {
    const sourcePath = randomDefaultImagePath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `./uploads/${filename}`;

    fs.copyFile(sourcePath, copyPath, (err) => {
      if (err) {
        throw new Error(`Failed to save default cover photo: ${err}`);
      }
    });
    const image = await this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      filename,
      groupId,
    });
    return image;
  }

  async deleteGroup(id: number) {
    await this.deleteCoverPhoto(id);
    await this.groupRepository.delete(id);
    return true;
  }

  async deleteCoverPhoto(id: number) {
    await this.imagesService.deleteImage({
      imageType: ImageTypes.CoverPhoto,
      group: { id },
    });
  }

  async createGroupMember(groupId: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId }, ["groups"]);
    const group = await this.getGroup({ id: groupId }, ["members"]);
    if (!user || !group) {
      throw new UserInputError("User or group not found");
    }
    await this.groupRepository.save({
      ...group,
      members: [...group.members, user],
    });
    return user;
  }

  async deleteGroupMember(id: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId }, ["groups"]);
    const group = await this.getGroup({ id }, ["members"]);
    if (!user || !group) {
      throw new UserInputError("User or group not found");
    }
    group.members = group.members.filter((member) => member.id !== userId);
    await this.groupRepository.save(group);
    return true;
  }

  async leaveGroup(id: number, userId: number) {
    const where = { group: { id }, userId };
    await this.deleteGroupMember(id, userId);
    await this.memberRequestsService.deleteMemberRequest(where);
    return true;
  }
}
