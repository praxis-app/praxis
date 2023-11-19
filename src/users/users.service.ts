import { UserInputError } from '@nestjs/apollo';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { IsFollowedByMeKey } from '../dataloader/dataloader.types';
import { GroupPrivacy } from '../groups/group-configs/models/group-config.model';
import { GroupPermissionsMap } from '../groups/group-roles/models/group-permissions.type';
import { ImageTypes } from '../images/image.constants';
import {
  getUploadsPath,
  randomDefaultImagePath,
  saveImage,
} from '../images/image.utils';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { Proposal } from '../proposals/models/proposal.model';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';
import { initServerRolePermissions } from '../server-roles/server-role.utils';
import { ServerRolesService } from '../server-roles/server-roles.service';
import { DEFAULT_PAGE_SIZE } from '../shared/shared.constants';
import { logTime, sanitizeText } from '../shared/shared.utils';
import { UpdateUserInput } from './models/update-user.input';
import { User } from './models/user.model';
import { UserWithFollowerCount, UserWithFollowingCount } from './user.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,

    @Inject(forwardRef(() => ServerRolesService))
    private serverRolesService: ServerRolesService,

    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,

    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  async getUser(where: FindOptionsWhere<User>, relations?: string[]) {
    return await this.repository.findOne({ where, relations });
  }

  async getUsers(where?: FindOptionsWhere<User>) {
    return this.repository.find({ where });
  }

  async isFirstUser() {
    const userCount = await this.repository.count();
    return userCount === 0;
  }

  async isPublicUserAvatar(imageId: number) {
    const image = await this.imagesService.getImage({ id: imageId }, [
      'user.groups.config',
    ]);
    if (!image?.user) {
      return false;
    }
    return image.user.groups.some(
      (group) => group.config.privacy === GroupPrivacy.Public,
    );
  }

  async getCoverPhoto(userId: number) {
    return this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      userId,
    });
  }

  async getUserHomeFeed(id: number) {
    const logTimeMessage = `Fetching user ${id} home feed`;
    logTime(logTimeMessage, this.logger);

    const userFeedQuery = this.repository
      .createQueryBuilder('user')

      // Posts from followed users
      .leftJoinAndSelect('user.following', 'userFollowing')
      .leftJoinAndSelect('userFollowing.posts', 'followingPost')

      // Posts and proposals from joined groups
      .leftJoinAndSelect('user.groups', 'userGroup')
      .leftJoinAndSelect('userGroup.posts', 'groupPost')
      .leftJoinAndSelect('userGroup.proposals', 'groupProposal')

      // Posts from joined group events
      .leftJoinAndSelect('userGroup.events', 'groupEvent')
      .leftJoinAndSelect('groupEvent.posts', 'groupEventPost')

      // Posts and proposals from this user
      .leftJoinAndSelect('user.proposals', 'userProposal')
      .leftJoinAndSelect('user.posts', 'userPost')

      // Only select required fields
      .select(['user.id', 'userGroup.id', 'groupEvent.id', 'userFollowing.id'])
      .addSelect([
        'userPost.id',
        'userPost.groupId',
        'userPost.eventId',
        'userPost.userId',
        'userPost.body',
        'userPost.createdAt',
      ])
      .addSelect([
        'userProposal.id',
        'userProposal.groupId',
        'userProposal.userId',
        'userProposal.stage',
        'userProposal.body',
        'userProposal.createdAt',
      ])
      .addSelect([
        'groupPost.id',
        'groupPost.groupId',
        'groupPost.userId',
        'groupPost.body',
        'groupPost.createdAt',
      ])
      .addSelect([
        'groupProposal.id',
        'groupProposal.groupId',
        'groupProposal.stage',
        'groupProposal.userId',
        'groupProposal.body',
        'groupProposal.createdAt',
      ])
      .addSelect([
        'groupEventPost.id',
        'groupEventPost.userId',
        'groupEventPost.eventId',
        'groupEventPost.body',
        'groupEventPost.createdAt',
      ])
      .addSelect([
        'followingPost.id',
        'followingPost.userId',
        'followingPost.eventId',
        'followingPost.body',
        'followingPost.createdAt',
      ])
      .where('user.id = :id', { id });

    const userFeed = await userFeedQuery.getOne();
    logTime(logTimeMessage, this.logger);

    if (!userFeed) {
      throw new UserInputError('User not found');
    }
    const { groups, following, posts, proposals } = userFeed;

    // Initialize maps with posts and proposals by this user
    const postMap = posts.reduce<Record<number, Post>>((result, post) => {
      result[post.id] = post;
      return result;
    }, {});
    const proposalMap = proposals.reduce<Record<number, Proposal>>(
      (result, proposal) => {
        result[proposal.id] = proposal;
        return result;
      },
      {},
    );

    const extractPosts = (items: { posts: Post[] }[]) =>
      items.flatMap((item) => item.posts);

    // Insert remaining posts from joined groups and followed users
    const remainingPosts = [
      ...extractPosts(groups.flatMap((group) => group.events)),
      ...extractPosts(following),
      ...extractPosts(groups),
    ];
    for (const post of remainingPosts) {
      postMap[post.id] = post;
    }

    // Insert proposals from joined groups
    const proposalsFromGroups = groups.flatMap((group) => group.proposals);
    for (const proposal of proposalsFromGroups) {
      proposalMap[proposal.id] = proposal;
    }

    const sortedFeed = [
      ...Object.values(postMap),
      ...Object.values(proposalMap),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // TODO: Update once pagination has been implemented
    return sortedFeed.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getUserProfileFeed(id: number) {
    const user = await this.getUser({ id }, ['proposals', 'posts']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFeed = [...user.posts, ...user.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // TODO: Update once pagination has been implemented
    return sortedFeed.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getUserPermissions(id: number) {
    const user = await this.getUser({ id }, [
      'serverRoles.permission',
      'groupRoles.permission',
    ]);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const serverPermissions = user.serverRoles.reduce<ServerPermissions>(
      (result, { permission }) => {
        for (const key in permission) {
          if (permission[key]) {
            result[key] = true;
          }
        }
        return result;
      },
      initServerRolePermissions(),
    );
    const groupPermissions = user.groupRoles.reduce<GroupPermissionsMap>(
      (result, { groupId, permission }) => {
        if (!result[groupId]) {
          result[groupId] = permission;
        } else {
          for (const key in permission) {
            if (permission[key]) {
              result[key] = true;
            }
          }
        }
        return result;
      },
      {},
    );
    return { serverPermissions, groupPermissions };
  }

  async getJoinedGroups(id: number) {
    const userWithGroups = await this.getUser({ id }, ['groups']);
    if (!userWithGroups) {
      return [];
    }
    return userWithGroups.groups;
  }

  async getFollowers(id: number) {
    const user = await this.getUser({ id }, ['followers']);
    if (!user) {
      throw new UserInputError('User not found');
    }

    // TODO: Update once pagination has been implemented
    return user.followers.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getFollowing(id: number) {
    const user = await this.getUser({ id }, ['following']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    return user.following;
  }

  async isUsersPost(postId: number, userId: number) {
    const post = await this.postsService.getPost(postId);
    return post.userId === userId;
  }

  async getUsersBatch(userIds: number[]) {
    const users = await this.getUsers({
      id: In(userIds),
    });
    return userIds.map(
      (id) =>
        users.find((user: User) => user.id === id) ||
        new Error(`Could not load user: ${id}`),
    );
  }

  async getProfilePicturesBatch(userIds: number[]) {
    const profilePictures = await this.imagesService.getImages({
      imageType: ImageTypes.ProfilePicture,
      userId: In(userIds),
    });
    return userIds.map(
      (id) =>
        profilePictures.find(
          (profilePicture: Image) => profilePicture.userId === id,
        ) || new Error(`Could not load profile picture: ${id}`),
    );
  }

  async getFollowerCountBatch(userIds: number[]) {
    const users = (await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.followers', 'follower')
      .loadRelationCountAndMap('user.followerCount', 'user.followers')
      .select(['user.id'])
      .whereInIds(userIds)
      .getMany()) as UserWithFollowerCount[];

    return userIds.map((id) => {
      const user = users.find((user: User) => user.id === id);
      if (!user) {
        return new Error(`Could not load followers count for user: ${id}`);
      }
      return user.followerCount;
    });
  }

  async getFollowingCountBatch(userIds: number[]) {
    const users = (await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.following', 'followed')
      .loadRelationCountAndMap('user.followingCount', 'user.following')
      .select(['user.id'])
      .whereInIds(userIds)
      .getMany()) as UserWithFollowingCount[];

    return userIds.map((id) => {
      const user = users.find((user: User) => user.id === id);
      if (!user) {
        return new Error(`Could not load following count for user: ${id}`);
      }
      return user.followingCount;
    });
  }

  async getIsFollowedByMeBatch(keys: IsFollowedByMeKey[]) {
    const followedUserIds = keys.map(({ followedUserId }) => followedUserId);
    const following = await this.getFollowing(keys[0].currentUserId);

    return followedUserIds.map((followedUserId) =>
      following.some(
        (followedUser: User) => followedUser.id === followedUserId,
      ),
    );
  }

  async createUser({ bio, ...userData }: Partial<User>) {
    const sanitizedBio = bio ? sanitizeText(bio.trim()) : undefined;
    const user = await this.repository.save({ bio: sanitizedBio, ...userData });

    try {
      const users = await this.getUsers();

      if (users.length === 1) {
        await this.serverRolesService.initAdminServerRole(user.id);
      }
      await this.saveDefaultProfilePicture(user.id);
    } catch {
      await this.deleteUser(user.id);
      throw new Error('Could not create user');
    }

    return user;
  }

  async updateUser({
    id,
    bio,
    coverPhoto,
    profilePicture,
    ...userData
  }: UpdateUserInput) {
    this.logger.log(`Updating user: ${JSON.stringify({ id, ...userData })}`);

    const sanitizedBio = sanitizeText(bio.trim());
    await this.repository.update(id, {
      bio: sanitizedBio,
      ...userData,
    });

    if (profilePicture) {
      await this.saveProfilePicture(id, profilePicture);
    }
    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }

    const user = await this.getUser({ id });
    return { user };
  }

  async followUser(id: number, followerId: number) {
    const user = await this.getUser({ id }, ['followers']);
    const follower = await this.getUser({ id: followerId }, ['following']);
    if (!user || !follower) {
      throw new UserInputError('User not found');
    }
    follower.following = [...follower.following, user];
    user.followers = [...user.followers, follower];
    await this.repository.save(follower);
    await this.repository.save(user);
    return {
      followedUser: user,
      follower,
    };
  }

  async unfollowUser(id: number, followerId: number) {
    const user = await this.getUser({ id }, ['followers']);
    const follower = await this.getUser({ id: followerId }, ['following']);
    if (!user || !follower) {
      throw new UserInputError('User not found');
    }
    // TODO: Refactor to avoid using `filter`
    user.followers = user.followers.filter((f) => f.id !== followerId);
    follower.following = follower.following.filter((f) => f.id !== id);
    await this.repository.save([user, follower]);
    return true;
  }

  async saveProfilePicture(
    userId: number,
    profilePicture: Promise<FileUpload>,
  ) {
    const filename = await saveImage(profilePicture, this.logger);
    const imageData = { imageType: ImageTypes.ProfilePicture, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveCoverPhoto(userId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto, this.logger);
    const imageData = { imageType: ImageTypes.CoverPhoto, userId };
    await this.imagesService.deleteImage(imageData);
    return this.imagesService.createImage({
      ...imageData,
      filename,
    });
  }

  async saveDefaultProfilePicture(userId: number) {
    const sourcePath = randomDefaultImagePath();
    const uploadsPath = getUploadsPath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `${uploadsPath}/${filename}`;

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
