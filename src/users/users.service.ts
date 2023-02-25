import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { Group } from "../groups/models/group.model";
import { randomDefaultImagePath, saveImage } from "../images/image.utils";
import { ImagesService, ImageTypes } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { PostsService } from "../posts/posts.service";
import { Proposal } from "../proposals/models/proposal.model";
import { RoleMembersService } from "../roles/role-members/role-members.service";
import { RolesService } from "../roles/roles.service";
import { UpdateUserInput } from "./models/update-user.input";
import { User } from "./models/user.model";

export interface UserPermissions {
  serverPermissions: Set<string>;
  groupPermissions: Record<number, Set<string>>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,

    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,

    private imagesService: ImagesService,
    private postsService: PostsService,
    private roleMembersService: RoleMembersService
  ) {}

  async getUser(where: FindOptionsWhere<User>, relations?: string[]) {
    return await this.repository.findOne({ where, relations });
  }

  async getUsers(where?: FindOptionsWhere<User>) {
    return this.repository.find({ where });
  }

  async getCoverPhoto(userId: number) {
    return this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      userId,
    });
  }

  async getUserHomeFeed(id: number) {
    // TODO: Get posts from followed users and joined groups, instead of all posts
    const posts = await this.postsService.getPosts();

    const userWithJoinedGroupProposals = await this.getUser({ id }, [
      "groupMembers.group.proposals",
    ]);
    if (!userWithJoinedGroupProposals) {
      throw new UserInputError("User not found");
    }

    const { groupMembers } = userWithJoinedGroupProposals;
    const proposals = groupMembers.reduce<Proposal[]>((result, groupMember) => {
      result.push(...groupMember.group.proposals);
      return result;
    }, []);

    const feed = [...posts, ...proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return feed;
  }

  async getUserProfileFeed(id: number) {
    const user = await this.getUser({ id }, ["proposals", "posts"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    const feed = [...user.posts, ...user.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return feed;
  }

  async getUserPermissions(id: number) {
    const roleMembers = await this.roleMembersService.getRoleMembers({
      where: { user: { id } },
      relations: ["role.permissions"],
    });
    return roleMembers.reduce<UserPermissions>(
      (result, { role: { groupId, permissions } }) => {
        for (const { name, enabled } of permissions) {
          if (!enabled) {
            continue;
          }
          if (groupId) {
            result.groupPermissions[groupId].add(name);
            continue;
          }
          result.serverPermissions.add(name);
        }
        return result;
      },
      { serverPermissions: new Set(), groupPermissions: {} }
    );
  }

  async getJoinedGroups(id: number) {
    const userWithGroups = await this.getUser({ id }, ["groupMembers.group"]);
    if (!userWithGroups) {
      return [];
    }
    return userWithGroups.groupMembers.reduce<Group[]>(
      (result, groupMember) => {
        result.push(groupMember.group);
        return result;
      },
      []
    );
  }

  async isUsersPost(postId: number, userId: number) {
    const post = await this.postsService.getPost(postId);
    if (!post) {
      throw new UserInputError("Post not found");
    }
    return post.userId === userId;
  }

  async getUsersByBatch(userIds: number[]) {
    const users = await this.getUsers({
      id: In(userIds),
    });
    const mappedUsers = userIds.map(
      (id) =>
        users.find((user: User) => user.id === id) ||
        new Error(`Could not load user: ${id}`)
    );
    return mappedUsers;
  }

  async getProfilePicturesByBatch(userIds: number[]) {
    const profilePictures = await this.imagesService.getImages({
      imageType: ImageTypes.ProfilePicture,
      userId: In(userIds),
    });
    const mappedProfilePictures = userIds.map(
      (id) =>
        profilePictures.find(
          (profilePicture: Image) => profilePicture.userId === id
        ) || new Error(`Could not load profile picture: ${id}`)
    );
    return mappedProfilePictures;
  }

  async createUser(data: Partial<User>) {
    const user = await this.repository.save(data);
    const users = await this.getUsers();

    try {
      if (users.length === 1) {
        await this.rolesService.initializeServerAdminRole(user.id);
      }
      await this.saveDefaultProfilePicture(user.id);
    } catch {
      await this.deleteUser(user.id);
      throw new Error("Could not create user");
    }

    return user;
  }

  async updateUser({
    id,
    coverPhoto,
    profilePicture,
    ...userData
  }: UpdateUserInput) {
    await this.repository.update(id, userData);
    const user = await this.getUser({ id });

    if (profilePicture) {
      await this.saveProfilePicture(id, profilePicture);
    }
    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }

    return { user };
  }

  async saveProfilePicture(
    userId: number,
    profilePicture: Promise<FileUpload>
  ) {
    const filename = await saveImage(profilePicture);
    const imageData = { imageType: ImageTypes.ProfilePicture, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveCoverPhoto(userId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    const imageData = { imageType: ImageTypes.CoverPhoto, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveDefaultProfilePicture(userId: number) {
    const sourcePath = randomDefaultImagePath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `./uploads/${filename}`;

    fs.copyFile(sourcePath, copyPath, (err) => {
      if (err) {
        throw new Error(`Failed to save default profile picture: ${err}`);
      }
    });

    const image = await this.imagesService.createImage({
      imageType: ImageTypes.ProfilePicture,
      filename,
      userId,
    });

    return image;
  }

  async deleteUser(userId: number) {
    return this.repository.delete(userId);
  }
}
