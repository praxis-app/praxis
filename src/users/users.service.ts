import { UserInputError } from '@nestjs/apollo';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Conversation } from '../chat/models/conversation.model';
import { VALID_NAME_REGEX } from '../common/common.constants';
import {
  logTime,
  normalizeText,
  paginate,
  sanitizeText,
} from '../common/common.utils';
import { GroupPermissionsMap } from '../groups/group-roles/models/group-permissions.type';
import { GroupPrivacy } from '../groups/groups.constants';
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
import { PostsService } from '../posts/posts.service';
import { Proposal } from '../proposals/models/proposal.model';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';
import { ServerRolesService } from '../server-roles/server-roles.service';
import { initServerRolePermissions } from '../server-roles/server-roles.utils';
import { QuestionnaireTicketConfig } from '../vibe-check/models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
import { ServerQuestion } from '../vibe-check/models/server-question.model';
import { UpdateUserInput } from './models/update-user.input';
import { User } from './models/user.model';
import { Message } from '../chat/models/message.model';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ServerQuestion)
    private serverQuestionRepository: Repository<ServerQuestion>,

    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    private notificationsService: NotificationsService,
    private serverConfigsService: ServerConfigsService,
    private serverRolesService: ServerRolesService,
    private postsService: PostsService,
  ) {}

  async getUser(where: FindOptionsWhere<User>, relations?: string[]) {
    return this.userRepository.findOne({ where, relations });
  }

  async getUsers(where?: FindOptionsWhere<User>, relations?: string[]) {
    return this.userRepository.find({ where, relations });
  }

  async getUsersCount(where?: FindOptionsWhere<User>) {
    return this.userRepository.count({ where });
  }

  async getPagedUsers(offset?: number, limit?: number) {
    const users = await this.getUsers();
    const sortedUsers = users.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedUsers, offset, limit)
      : sortedUsers;
  }

  async isFirstUser() {
    const userCount = await this.userRepository.count();
    return userCount === 0;
  }

  async isVerifiedUser(id: number) {
    const { verified } = await this.userRepository.findOneOrFail({
      where: { id },
      select: { verified: true },
    });
    return verified;
  }

  async isOwnUserAvatar(userId: number, imageId: number) {
    const count = await this.imageRepository.count({
      where: { id: imageId, userId, imageType: ImageTypes.ProfilePicture },
    });
    return count > 0;
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
        'userPost.sharedPostId',
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
        'followingPost.sharedPostId',
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
        'groupPost.sharedPostId',
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
        'groupEventPost.sharedPostId',
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
    return offset !== undefined
      ? paginate(sortedFeed, offset, limit)
      : sortedFeed;
  }

  async getUserProfileFeedCount(id: number) {
    const postsCount = await this.postRepository.count({
      where: { userId: id },
    });
    const proposalsCount = await this.proposalRepository.count({
      where: { userId: id },
    });
    return postsCount + proposalsCount;
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
          if (['id', 'serverRoleId', 'createdAt', 'updatedAt'].includes(key)) {
            continue;
          }
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
            if (['id', 'groupRoleId', 'createdAt', 'updatedAt'].includes(key)) {
              continue;
            }
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
    return userWithGroups.groups.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getFollowers(id: number, offset?: number, limit?: number) {
    const user = await this.getUser({ id }, ['followers']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFollowers = user.followers.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedFollowers, offset, limit)
      : sortedFollowers;
  }

  async getFollowing(id: number, offset?: number, limit?: number) {
    const user = await this.getUser({ id }, ['following']);
    if (!user) {
      throw new UserInputError('User not found');
    }
    const sortedFollowing = user.following.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return offset !== undefined
      ? paginate(sortedFollowing, offset, limit)
      : sortedFollowing;
  }

  async isUsersPost(postId: number, userId: number) {
    const post = await this.postsService.getPost(postId);
    return post.userId === userId;
  }

  async getUserChats(userId: number, offset?: number, limit?: number) {
    const chats = await this.conversationRepository.find({
      where: { members: { userId } },
    });
    const lastMessages = await Promise.all(
      chats.map(async (chat) => {
        return this.messageRepository.findOne({
          where: { conversationId: chat.id },
          order: { createdAt: 'DESC' },
        });
      }),
    );
    const chatToLastMessageMap = lastMessages.reduce((result, message) => {
      if (message) {
        result[message.conversationId] = message;
      }
      return result;
    }, {});

    const sortedChats = chats.sort((chatA, chatB) => {
      const lastMessageA = chatToLastMessageMap[chatA.id];
      const lastMessageB = chatToLastMessageMap[chatB.id];
      const createdAtA = lastMessageA?.createdAt || chatA.createdAt;
      const createdAtB = lastMessageB?.createdAt || chatB.createdAt;
      return createdAtB.getTime() - createdAtA.getTime();
    });

    return offset !== undefined
      ? paginate(sortedChats, offset, limit)
      : sortedChats;
  }

  async getUserChatCount(userId: number) {
    return this.conversationRepository.count({
      where: { members: { userId } },
    });
  }

  async getQuestionnaireTicket(userId: number) {
    return this.questionnaireTicketRepository.findOne({
      where: { userId },
    });
  }

  async createNewUserTicket(userId: number, serverQuestions: ServerQuestion[]) {
    const serverConfig = await this.serverConfigsService.getServerConfig();

    const closingAt = serverConfig.votingTimeLimit
      ? new Date(Date.now() + serverConfig.votingTimeLimit * 60 * 1000)
      : undefined;

    // Set the config for new ticket with current server config
    const config: Partial<QuestionnaireTicketConfig> = {
      decisionMakingModel: serverConfig.decisionMakingModel,
      standAsidesLimit: serverConfig.standAsidesLimit,
      reservationsLimit: serverConfig.reservationsLimit,
      ratificationThreshold: serverConfig.ratificationThreshold,
      closingAt,
    };

    // Set snapshot of server questions for the new ticket
    const questions = serverQuestions.map((question) => ({
      text: question.text,
      priority: question.priority,
    }));

    // Set a snapshot for number of members at the time of ticket creation
    const usersWithAccess = await this.userRepository.find({
      where: {
        serverRoles: {
          permission: { manageQuestionnaireTickets: true },
        },
      },
    });

    const questionnaireTicket = await this.questionnaireTicketRepository.save({
      initialMemberCount: usersWithAccess.length,
      questions,
      config,
      userId,
    });

    // Notify users with access that a new ticket has been created
    for (const user of usersWithAccess) {
      await this.notificationsService.createNotification({
        notificationType: NotificationType.NewQuestionnaireTicket,
        questionnaireTicketId: questionnaireTicket.id,
        otherUserId: userId,
        userId: user.id,
      });
    }
  }

  async createUser(name: string, email: string, password: string) {
    const isFirstUser = await this.isFirstUser();
    const serverQuestions = await this.serverQuestionRepository.find();
    const verified = isFirstUser || serverQuestions.length === 0;
    const normalizedEmail = normalizeText(email);

    const user = await this.userRepository.save({
      email: normalizedEmail,
      password,
      verified,
      name,
    });

    await this.saveDefaultProfilePicture(user.id);

    if (isFirstUser) {
      await this.serverRolesService.createAdminServerRole(user.id);
    } else if (serverQuestions.length > 0) {
      await this.createNewUserTicket(user.id, serverQuestions);
    }

    return user;
  }

  async updateUser(currentUser: User, input: UpdateUserInput) {
    this.logger.log(
      `Updating user: ${JSON.stringify({ id: currentUser.id, ...input })}`,
    );

    const { name, displayName, bio, profilePicture, coverPhoto } = input;
    const isValidName = VALID_NAME_REGEX.test(name);
    if (!isValidName) {
      throw new Error('Usernames cannot contain special characters');
    }
    if (name && name.length < 2) {
      throw new Error('Username must be at least 2 characters');
    }
    if (name && name.length > 15) {
      throw new Error('Username cannot exceed 15 characters');
    }
    if (displayName && displayName.length < 4) {
      throw new Error('Display name must be at least 4 characters');
    }
    if (displayName && displayName.length > 30) {
      throw new Error('Display name cannot exceed 30 characters');
    }

    const usersWithNameCount = await this.getUsersCount({ name });
    if (currentUser.name !== name && usersWithNameCount > 0) {
      throw new Error('Username is already in use');
    }

    const isVerified = await this.isVerifiedUser(currentUser.id);
    if (!isVerified && (profilePicture || coverPhoto)) {
      throw new Error(
        'Cannot update profile picture or cover photo for unverified users',
      );
    }

    await this.userRepository.update(currentUser.id, {
      displayName: sanitizeText(displayName),
      name: sanitizeText(name),
      bio: sanitizeText(bio),
    });

    if (profilePicture) {
      await this.saveProfilePicture(currentUser.id, profilePicture);
    }
    if (coverPhoto) {
      await this.saveCoverPhoto(currentUser.id, coverPhoto);
    }

    const user = await this.getUser({ id: currentUser.id });
    return { user };
  }

  async followUser(id: number, followerId: number) {
    const user = await this.getUser({ id }, ['followers']);
    const follower = await this.getUser({ id: followerId }, ['following']);
    if (!user || !follower) {
      throw new Error('User not found');
    }
    follower.following = [...follower.following, user];
    user.followers = [...user.followers, follower];
    await this.userRepository.save(follower);
    await this.userRepository.save(user);

    await this.notificationsService.createNotification({
      notificationType: NotificationType.Follow,
      otherUserId: followerId,
      userId: user.id,
    });

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

    await this.notificationsService.deleteNotifications({
      notificationType: NotificationType.Follow,
      otherUserId: followerId,
      userId: user.id,
    });

    return true;
  }

  async lockUserAccount(userId: number) {
    await this.userRepository.update(userId, {
      locked: true,
    });
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
