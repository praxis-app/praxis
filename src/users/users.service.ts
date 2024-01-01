import { UserInputError } from '@nestjs/apollo';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { logTime, paginate, sanitizeText } from '../common/common.utils';
import { IsFollowedByMeKey } from '../dataloader/dataloader.types';
import { GroupPermissionsMap } from '../groups/group-roles/models/group-permissions.type';
import { GroupPrivacy } from '../groups/groups.constants';
import { ImageTypes } from '../images/image.constants';
import {
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { Proposal } from '../proposals/models/proposal.model';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';
import { initServerRolePermissions } from '../server-roles/server-role.utils';
import { ServerRolesService } from '../server-roles/server-roles.service';
import { UpdateUserInput } from './models/update-user.input';
import { User } from './models/user.model';
import { UserWithFollowerCount, UserWithFollowingCount } from './user.types';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    private serverRolesService: ServerRolesService,
    private postsService: PostsService,
  ) {}

  async getUser(where: FindOptionsWhere<User>, relations?: string[]) {
    return await this.userRepository.findOne({ where, relations });
  }

  async getUsers(where?: FindOptionsWhere<User>) {
    return this.userRepository.find({ where });
  }

  async getPagedUsers(offset?: number, limit?: number) {
    const users = await this.getUsers();
    const sortedUsers = users.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined ? paginate(sortedUsers, offset, limit) : sortedUsers;

    return { nodes, totalCount: sortedUsers.length };
  }

  async isFirstUser() {
    const userCount = await this.userRepository.count();
    return userCount === 0;
  }

  async isPublicUserAvatar(imageId: number) {
    const image = await this.imageRepository.findOneOrFail({
      where: { id: imageId },
      relations: ['user.groups.config'],
    });
    if (!image.user) {
      return false;
    }
    return image.user.groups.some(
      (group) => group.config.privacy === GroupPrivacy.Public,
    );
  }

  async getCoverPhoto(userId: number) {
    return this.imageRepository.findOne({
      where: { userId, imageType: ImageTypes.CoverPhoto },
    });
  }

  async getBaseUserFeed(id: number) {
    const userFeedQuery = this.userRepository
      .createQueryBuilder('user')

      // Posts from followed users
      .leftJoinAndSelect('user.following', 'userFollowing')
      .leftJoinAndSelect('userFollowing.posts', 'followingPost')

      // Posts and proposals from this user
      .leftJoinAndSelect('user.proposals', 'userProposal')
      .leftJoinAndSelect('user.posts', 'userPost')

      // Only select required fields
      .select(['user.id', 'userFollowing.id'])
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
        'followingPost.id',
        'followingPost.userId',
        'followingPost.eventId',
        'followingPost.groupId',
        'followingPost.body',
        'followingPost.createdAt',
      ])
      .where('user.id = :id', { id });

    const userFeed = await userFeedQuery.getOne();
    if (!userFeed) {
      throw new UserInputError('User not found');
    }
    return userFeed;
  }

  async getJoinedGroupsFeed(id: number) {
    const joinedGroupsFeedQuery = this.userRepository
      .createQueryBuilder('user')

      // Posts and proposals from joined groups
      .leftJoinAndSelect('user.groups', 'userGroup')
      .leftJoinAndSelect('userGroup.posts', 'groupPost')
      .leftJoinAndSelect('userGroup.proposals', 'groupProposal')

      // Only select required fields
      .select(['user.id', 'userGroup.id'])
      .addSelect([
        'groupPost.id',
        'groupPost.groupId',
        'groupPost.eventId',
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
      .where('user.id = :id', { id });

    const joinedGroupsFeed = await joinedGroupsFeedQuery.getOne();
    if (!joinedGroupsFeed) {
      throw new UserInputError('User not found');
    }

    const { groups } = joinedGroupsFeed;
    const groupPosts = groups.flatMap((group) => group.posts);
    const groupProposals = groups.flatMap((group) => group.proposals);

    return { groupPosts, groupProposals };
  }

  async getUserFeedEventPosts(id: number) {
    const eventPostsQuery = this.userRepository
      .createQueryBuilder('user')

      // Posts from joined group events
      .leftJoinAndSelect('user.groups', 'userGroup')
      .leftJoinAndSelect('userGroup.events', 'groupEvent')
      .leftJoinAndSelect('groupEvent.posts', 'groupEventPost')

      // Only select required fields
      .select(['user.id', 'userGroup.id', 'groupEvent.id'])
      .addSelect([
        'groupEventPost.id',
        'groupEventPost.userId',
        'groupEventPost.eventId',
        'groupEventPost.body',
        'groupEventPost.createdAt',
      ])
      .where('user.id = :id', { id });

    const userWithEventPosts = await eventPostsQuery.getOne();
    if (!userWithEventPosts) {
      throw new UserInputError('User not found');
    }

    const extractedEvents = userWithEventPosts.groups.flatMap(
      (group) => group.events,
    );
    return extractedEvents.flatMap((event) => event.posts);
  }

  async getUserFeed(id: number, offset?: number, limit?: number) {
    const logTimeMessage = `Fetching home feed for user with ID ${id}`;
    logTime(logTimeMessage, this.logger);

    const userFeed = await this.getBaseUserFeed(id);
    const eventPosts = await this.getUserFeedEventPosts(id);
    const { groupPosts, groupProposals } = await this.getJoinedGroupsFeed(id);
    const { posts, proposals, following } = userFeed;

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

    // Insert remaining posts from joined groups and followed users
    const followingPosts = following.flatMap((user) => user.posts);
    const remainingPosts = [...followingPosts, ...groupPosts, ...eventPosts];
    for (const post of remainingPosts) {
      postMap[post.id] = post;
    }

    // Insert proposals from joined groups
    for (const proposal of groupProposals) {
      proposalMap[proposal.id] = proposal;
    }

    const sortedFeed = [
      ...Object.values(postMap),
      ...Object.values(proposalMap),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const nodes =
      offset !== undefined ? paginate(sortedFeed, offset, limit) : sortedFeed;
    logTime(logTimeMessage, this.logger);

    return { nodes, totalCount: sortedFeed.length };
  }

  async getUserProfileFeed(id: number, offset?: number, limit?: number) {
    const user = await this.getUser({ id }, ['proposals', 'posts']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFeed = [...user.posts, ...user.proposals].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined ? paginate(sortedFeed, offset, limit) : sortedFeed;

    return { nodes, totalCount: sortedFeed.length };
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

  async getFollowers(id: number, offset?: number, limit?: number) {
    const user = await this.getUser({ id }, ['followers']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFollowers = user.followers.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined
        ? paginate(sortedFollowers, offset, limit)
        : sortedFollowers;

    return { nodes, totalCount: sortedFollowers.length };
  }

  async getFollowing(id: number, offset?: number, limit?: number) {
    const user = await this.getUser({ id }, ['following']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFollowing = user.following.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const nodes =
      offset !== undefined
        ? paginate(sortedFollowing, offset, limit)
        : sortedFollowing;

    return { nodes, totalCount: sortedFollowing.length };
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
    const profilePictures = await this.imageRepository.find({
      where: { userId: In(userIds), imageType: ImageTypes.ProfilePicture },
    });
    return userIds.map(
      (id) =>
        profilePictures.find(
          (profilePicture: Image) => profilePicture.userId === id,
        ) || new Error(`Could not load profile picture: ${id}`),
    );
  }

  async getFollowerCountBatch(userIds: number[]) {
    const users = (await this.userRepository
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
    const users = (await this.userRepository
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
    const user = await this.getUser({ id: keys[0].currentUserId }, [
      'following',
    ]);
    if (!user) {
      throw new UserInputError('User not found');
    }

    return followedUserIds.map((followedUserId) =>
      user.following.some(
        (followedUser: User) => followedUser.id === followedUserId,
      ),
    );
  }

  async createUser({ bio, ...userData }: Partial<User>) {
    const sanitizedBio = bio ? sanitizeText(bio.trim()) : undefined;
    const user = await this.userRepository.save({
      bio: sanitizedBio,
      ...userData,
    });

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
    await this.userRepository.update(id, {
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
    await this.userRepository.save(follower);
    await this.userRepository.save(user);
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
    await this.userRepository.save([user, follower]);
    return true;
  }

  async saveProfilePicture(
    userId: number,
    profilePicture: Promise<FileUpload>,
  ) {
    const filename = await saveImage(profilePicture, this.logger);
    const imageData = { imageType: ImageTypes.ProfilePicture, userId };
    await this.deleteUserImage(userId, ImageTypes.ProfilePicture);
    return this.imageRepository.save({
      ...imageData,
      filename,
    });
  }

  async saveCoverPhoto(userId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto, this.logger);
    const imageData = { imageType: ImageTypes.CoverPhoto, userId };
    await this.deleteUserImage(userId, ImageTypes.CoverPhoto);
    return this.imageRepository.save({
      ...imageData,
      filename,
    });
  }

  async saveDefaultProfilePicture(userId: number) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.ProfilePicture,
      filename,
      userId,
    });
  }

  async deleteUser(userId: number) {
    const images = await this.imageRepository.find({ where: { userId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.userRepository.delete(userId);
    return true;
  }

  async deleteUserImage(userId: number, imageType: ImageTypes) {
    const image = await this.imageRepository.findOne({
      where: { userId, imageType },
    });
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.imageRepository.delete({ userId, imageType });
    return true;
  }
}
