/**
 * TODO: Determine whether data loaders should be renamed to more
 * clearly indicate whether IDs are being mapped to one or many
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DataLoader from 'dataloader';
import { In, Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { EventAttendeeStatus } from '../events/models/event-attendee.model';
import { Event } from '../events/models/event.model';
import { initGroupRolePermissions } from '../groups/group-roles/group-role.utils';
import { GroupPermissions } from '../groups/group-roles/models/group-permissions.type';
import { GroupRole } from '../groups/group-roles/models/group-role.model';
import { GroupMemberRequestStatus } from '../groups/models/group-member-request.model';
import { Group } from '../groups/models/group.model';
import { ImageTypes } from '../images/image.constants';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { Question } from '../questions/models/question.model';
import { QuestionnaireTicket } from '../questions/models/questionnaire-ticket.model';
import { ServerRole } from '../server-roles/models/server-role.model';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { Vote } from '../votes/models/vote.model';
import {
  CommentWithLikeCount,
  Dataloaders,
  EventWithGoingCount,
  EventWithInterestedCount,
  GroupRoleWithMemberCount,
  GroupWithMemberCount,
  GroupWithMemberRequestCount,
  IsCommentLikedByMeKey,
  IsFollowedByMeKey,
  IsPostLikedByMeKey,
  IsQuestionLikedByMeKey,
  MyGroupsKey,
  PostWithCommentCount,
  PostWithLikeCount,
  ProposalWithCommentCount,
  ProposalWithVoteCount,
  ServerRoleWithMemberCount,
  UserWithFollowerCount,
  UserWithFollowingCount,
} from './dataloader.types';

@Injectable()
export class DataloaderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    @InjectRepository(ProposalAction)
    private proposalActionRepository: Repository<ProposalAction>,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Like)
    private likeRepository: Repository<Like>,

    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,

    @InjectRepository(ServerRole)
    private serverRoleRepository: Repository<ServerRole>,

    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    private usersService: UsersService,
  ) {}

  getLoaders(): Dataloaders {
    return {
      // Proposals & Votes
      proposalsLoader: this._createProposalsLoader(),
      proposalActionsLoader: this._createProposalActionsLoader(),
      proposalImagesLoader: this._createProposalImagesLoader(),
      proposalVoteCountLoader: this._createProposalVoteCountLoader(),
      proposalVotesLoader: this._createProposalVotesLoader(),
      proposalCommentCountLoader: this._createProposalCommentCountLoader(),

      // Posts
      postsLoader: this._createPostsLoader(),
      isPostLikedByMeLoader: this._createIsPostLikedByMeLoader(),
      postCommentCountLoader: this._createPostCommentCountLoader(),
      postImagesLoader: this._createPostImagesLoader(),
      postLikeCountLoader: this._createPostLikeCountLoader(),
      postLikesLoader: this._createPostLikesLoader(),

      // Comments
      commentsLoader: this._createCommentsLoader(),
      commentImagesLoader: this._createCommentImagesLoader(),
      commentLikeCountLoader: this._createCommentLikeCountLoader(),
      commentLikesLoader: this._createCommentLikesLoader(),
      isCommentLikedByMeLoader: this._createIsCommentLikedByMeLoader(),

      // Groups
      groupCoverPhotosLoader: this._createGroupCoverPhotosLoader(),
      groupMemberCountLoader: this._createGroupMemberCountLoader(),
      groupMembersLoader: this._createGroupMembersLoader(),
      groupsLoader: this._createGroupsLoader(),
      isJoinedByMeLoader: this._createIsJoinedByMeLoader(),
      memberRequestCountLoader: this._createMemberRequestCountLoader(),

      // Users
      followerCountLoader: this._createFollowerCountLoader(),
      followingCountLoader: this._createFollowingCountLoader(),
      isFollowedByMeLoader: this._createIsFollowedByMeLoader(),
      profilePicturesLoader: this._createProfilePicturesLoader(),
      usersLoader: this._createUsersLoader(),

      // Roles & Permissions
      groupRoleMemberCountLoader: this._createGroupRoleMemberCountLoader(),
      serverRoleMemberCountLoader: this._createServerRoleMemberCountLoader(),
      myGroupPermissionsLoader: this._createMyGroupPermissionsLoader(),

      // Events
      eventCoverPhotosLoader: this._createEventCoverPhotosLoader(),
      interestedCountLoader: this._createInterestedCountLoader(),
      goingCountLoader: this._createGoingCountLoader(),
      eventsLoader: this._createEventsLoader(),

      // Questions & Answers
      questionsLoader: this._createQuestionsLoader(),
      questionnaireTicketsLoader: this._createQuestionnaireTicketLoader(),
      isAnswerLikedByMeLoader: this._createIsAnswerLikedByMeLoader(),
    };
  }

  /**
   * Creates a new dataloader with the given batch function and options.
   *
   * Passing a custom batch schedule function enables dataloader to work
   * with asynchronous middleware.
   *
   * Source: https://dev.to/tsirlucas/integrating-dataloader-with-concurrent-react-53h1
   */
  private _getDataLoader<K, V, C = K>(
    batchFn: DataLoader.BatchLoadFn<K, V>,
    options: DataLoader.Options<K, V, C> = {},
  ) {
    return new DataLoader<K, V, C>(batchFn, {
      batchScheduleFn: (callback) => setTimeout(callback, 5),
      ...options,
    });
  }

  // -------------------------------------------------------------------------
  // Proposals & Votes
  // -------------------------------------------------------------------------

  private _createProposalsLoader() {
    return this._getDataLoader<number, Proposal>(async (proposalIds) => {
      const proposals = await this.proposalRepository.find({
        where: { id: In(proposalIds) },
      });
      return proposalIds.map(
        (id) =>
          proposals.find((proposal: Proposal) => proposal.id === id) ||
          new Error(`Could not load proposal: ${id}`),
      );
    });
  }

  private _createProposalVotesLoader() {
    return this._getDataLoader<number, Vote[]>(async (proposalIds) => {
      const votes = await this.voteRepository.find({
        where: { proposalId: In(proposalIds) },
      });
      const mappedVotes = proposalIds.map(
        (id) =>
          votes.filter((vote: Vote) => vote.proposalId === id) ||
          new Error(`Could not load votes for proposal: ${id}`),
      );
      return mappedVotes;
    });
  }

  private _createProposalVoteCountLoader() {
    return this._getDataLoader<number, number>(async (proposalIds) => {
      const proposals = (await this.proposalRepository
        .createQueryBuilder('proposal')
        .leftJoinAndSelect('proposal.votes', 'vote')
        .loadRelationCountAndMap('proposal.voteCount', 'proposal.votes')
        .select(['proposal.id'])
        .whereInIds(proposalIds)
        .getMany()) as ProposalWithVoteCount[];

      return proposalIds.map((id) => {
        const proposal = proposals.find(
          (proposal: Proposal) => proposal.id === id,
        );
        if (!proposal) {
          return new Error(`Could not load vote count for proposal: ${id}`);
        }
        return proposal.voteCount;
      });
    });
  }

  private _createProposalImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (proposalIds) => {
      const images = await this.imageRepository.find({
        where: { proposalId: In(proposalIds) },
      });
      const mappedProposalImages = proposalIds.map(
        (id) =>
          images.filter((image: Image) => image.proposalId === id) ||
          new Error(`Could not load images for proposal: ${id}`),
      );
      return mappedProposalImages;
    });
  }

  private _createProposalActionsLoader() {
    return this._getDataLoader<number, ProposalAction>(
      async (proposalActionIds) => {
        const proposalActions = await this.proposalActionRepository.find({
          where: { id: In(proposalActionIds) },
        });
        return proposalActionIds.map(
          (id) =>
            proposalActions.find(
              (proposalAction: ProposalAction) => proposalAction.id === id,
            ) || new Error(`Could not load proposal action: ${id}`),
        );
      },
    );
  }

  private _createProposalCommentCountLoader() {
    return this._getDataLoader<number, number>(async (proposalIds) => {
      const proposals = (await this.proposalRepository
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
    });
  }

  // -------------------------------------------------------------------------
  // Posts
  // -------------------------------------------------------------------------

  private _createPostsLoader() {
    return this._getDataLoader<number, Post>(async (postIds) => {
      const posts = await this.postRepository.find({
        where: { id: In(postIds) },
      });
      return postIds.map(
        (id) =>
          posts.find((post: Post) => post.id === id) ||
          new Error(`Could not load post: ${id}`),
      );
    });
  }

  private _createIsPostLikedByMeLoader() {
    return this._getDataLoader<IsPostLikedByMeKey, boolean, number>(
      async (keys) => {
        const postIds = keys.map(({ postId }) => postId);
        const likes = await this.likeRepository.find({
          where: {
            postId: In(postIds),
            userId: keys[0].currentUserId,
          },
        });
        return postIds.map((postId) =>
          likes.some((like: Like) => like.postId === postId),
        );
      },
      { cacheKeyFn: (key) => key.postId },
    );
  }

  private _createPostImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (postIds) => {
      const images = await this.imageRepository.find({
        where: { postId: In(postIds) },
      });
      return postIds.map(
        (id) =>
          images.filter((image: Image) => image.postId === id) ||
          new Error(`Could not load images for post: ${id}`),
      );
    });
  }

  private _createPostLikesLoader() {
    return this._getDataLoader<number, Like[]>(async (postIds) => {
      const likes = await this.likeRepository.find({
        where: { postId: In(postIds) },
      });
      return postIds.map(
        (id) =>
          likes.filter((like: Like) => like.postId === id) ||
          new Error(`Could not load likes for post: ${id}`),
      );
    });
  }

  private _createPostLikeCountLoader() {
    return this._getDataLoader<number, number>(async (postIds) => {
      const posts = (await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.likes', 'like')
        .loadRelationCountAndMap('post.likeCount', 'post.likes')
        .select(['post.id'])
        .whereInIds(postIds)
        .getMany()) as PostWithLikeCount[];

      return postIds.map((id) => {
        const post = posts.find((post: Post) => post.id === id);
        if (!post) {
          return new Error(`Could not load like count for post: ${id}`);
        }
        return post.likeCount;
      });
    });
  }

  private _createPostCommentCountLoader() {
    return this._getDataLoader<number, number>(async (postIds) => {
      const posts = (await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.comments', 'comment')
        .loadRelationCountAndMap('post.commentCount', 'post.comments')
        .select(['post.id'])
        .whereInIds(postIds)
        .getMany()) as PostWithCommentCount[];

      return postIds.map((id) => {
        const post = posts.find((post: Post) => post.id === id);
        if (!post) {
          return new Error(`Could not load comment count for post: ${id}`);
        }
        return post.commentCount;
      });
    });
  }

  // -------------------------------------------------------------------------
  // Comments
  // -------------------------------------------------------------------------

  private _createCommentsLoader() {
    return this._getDataLoader<number, Comment>(async (commentIds) => {
      const comments = await this.commentRepository.find({
        where: { id: In(commentIds) },
      });
      return commentIds.map(
        (id) =>
          comments.find((comment: Comment) => comment.id === id) ||
          new Error(`Could not load comment: ${id}`),
      );
    });
  }

  private _createCommentImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (commentIds) => {
      const images = await this.imageRepository.find({
        where: { commentId: In(commentIds) },
      });
      return commentIds.map(
        (id) =>
          images.filter((image: Image) => image.commentId === id) ||
          new Error(`Could not load images for comment: ${id}`),
      );
    });
  }

  private _createCommentLikesLoader() {
    return this._getDataLoader<number, Like[]>(async (commentIds) => {
      const likes = await this.likeRepository.find({
        where: { commentId: In(commentIds) },
      });
      return commentIds.map(
        (id) =>
          likes.filter((like: Like) => like.commentId === id) ||
          new Error(`Could not load likes for comment: ${id}`),
      );
    });
  }

  private _createCommentLikeCountLoader() {
    return this._getDataLoader<number, number>(async (commentIds) => {
      const comments = (await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.likes', 'like')
        .loadRelationCountAndMap('comment.likeCount', 'comment.likes')
        .select(['comment.id'])
        .whereInIds(commentIds)
        .getMany()) as CommentWithLikeCount[];

      return commentIds.map((id) => {
        const comment = comments.find((comment: Comment) => comment.id === id);
        if (!comment) {
          return new Error(`Could not load like count for comment: ${id}`);
        }
        return comment.likeCount;
      });
    });
  }

  private _createIsCommentLikedByMeLoader() {
    return this._getDataLoader<IsCommentLikedByMeKey, boolean, number>(
      async (keys) => {
        const commentIds = keys.map(({ commentId }) => commentId);
        const likes = await this.likeRepository.find({
          where: {
            commentId: In(commentIds),
            userId: keys[0].currentUserId,
          },
        });
        return commentIds.map((commentId) =>
          likes.some((like: Like) => like.commentId === commentId),
        );
      },
      { cacheKeyFn: (key) => key.commentId },
    );
  }

  // -------------------------------------------------------------------------
  // Groups
  // -------------------------------------------------------------------------

  private _createGroupsLoader() {
    return this._getDataLoader<number, Group>(async (groupIds) => {
      const groups = await this.groupRepository.find({
        where: { id: In(groupIds) },
      });
      return groupIds.map(
        (id) =>
          groups.find((group: Group) => group.id === id) ||
          new Error(`Could not load group: ${id}`),
      );
    });
  }

  private _createGroupCoverPhotosLoader() {
    return this._getDataLoader<number, Image>(async (groupIds) => {
      const coverPhotos = await this.imageRepository.find({
        where: { groupId: In(groupIds), imageType: ImageTypes.CoverPhoto },
      });
      const mappedGroupCoverPhotos = groupIds.map(
        (id) =>
          coverPhotos.find((coverPhoto: Image) => coverPhoto.groupId === id) ||
          new Error(`Could not load cover photo for group: ${id}`),
      );
      return mappedGroupCoverPhotos;
    });
  }

  private _createMemberRequestCountLoader() {
    return this._getDataLoader<number, number>(async (groupIds) => {
      const groups = (await this.groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.memberRequests', 'memberRequest')
        .loadRelationCountAndMap(
          'group.memberRequestCount',
          'group.memberRequests',
          'memberRequest',
          (qb) =>
            qb.andWhere('memberRequest.status = :status', {
              status: GroupMemberRequestStatus.Pending,
            }),
        )
        .select(['group.id'])
        .whereInIds(groupIds)
        .getMany()) as GroupWithMemberRequestCount[];

      return groupIds.map((id) => {
        const group = groups.find((group: Group) => group.id === id);
        if (!group) {
          return new Error(`Could not load member request count: ${id}`);
        }
        return group.memberRequestCount;
      });
    });
  }

  private _createGroupMemberCountLoader() {
    return this._getDataLoader<number, number>(async (groupIds) => {
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
    });
  }

  private _createGroupMembersLoader() {
    return this._getDataLoader<number, User[]>(async (groupIds) => {
      const groups = await this.groupRepository.find({
        where: { id: In(groupIds) },
        relations: ['members'],
      });
      return groupIds.map((groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (!group) {
          return new Error(`Could not load group members: ${groupId}`);
        }
        return group.members;
      });
    });
  }

  private _createIsJoinedByMeLoader() {
    return this._getDataLoader<MyGroupsKey, boolean, number>(
      async (keys) => {
        const groupIds = keys.map(({ groupId }) => groupId);
        const groups = await this.groupRepository.find({
          where: { id: In(groupIds) },
          relations: ['members'],
        });

        return groupIds.map((groupId) => {
          const group = groups.find((g) => g.id === groupId);
          if (!group) {
            return new Error(`Could not load group: ${groupId}`);
          }
          return group.members.some(
            (member) => member.id === keys[0].currentUserId,
          );
        });
      },
      { cacheKeyFn: (key) => key.groupId },
    );
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  private _createFollowerCountLoader() {
    return this._getDataLoader<number, number>(async (userIds) => {
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
    });
  }

  private _createFollowingCountLoader() {
    return this._getDataLoader<number, number>(async (userIds) => {
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
    });
  }

  private _createIsFollowedByMeLoader() {
    return this._getDataLoader<IsFollowedByMeKey, boolean, number>(
      async (keys) => {
        const followedUserIds = keys.map(
          ({ followedUserId }) => followedUserId,
        );
        const user = await this.userRepository.findOneOrFail({
          where: { id: keys[0].currentUserId },
          relations: ['following'],
        });
        if (!user) {
          throw new Error('User not found');
        }

        return followedUserIds.map((followedUserId) =>
          user.following.some(
            (followedUser: User) => followedUser.id === followedUserId,
          ),
        );
      },
      { cacheKeyFn: (key) => key.followedUserId },
    );
  }

  private _createUsersLoader() {
    return this._getDataLoader<number, User>(async (userIds) => {
      const users = await this.userRepository.find({
        where: { id: In(userIds) },
      });
      return userIds.map(
        (id) =>
          users.find((user: User) => user.id === id) ||
          new Error(`Could not load user: ${id}`),
      );
    });
  }

  private _createProfilePicturesLoader() {
    return this._getDataLoader<number, Image>(async (userIds) => {
      const profilePictures = await this.imageRepository.find({
        where: { userId: In(userIds), imageType: ImageTypes.ProfilePicture },
      });
      return userIds.map(
        (id) =>
          profilePictures.find(
            (profilePicture: Image) => profilePicture.userId === id,
          ) || new Error(`Could not load profile picture: ${id}`),
      );
    });
  }

  // -------------------------------------------------------------------------
  // Roles & Permissions
  // -------------------------------------------------------------------------

  private _createGroupRoleMemberCountLoader() {
    return this._getDataLoader<number, number>(async (roleIds) => {
      const groupRoles = (await this.groupRoleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.members', 'roleMember')
        .loadRelationCountAndMap('role.memberCount', 'role.members')
        .select(['role.id'])
        .whereInIds(roleIds)
        .getMany()) as GroupRoleWithMemberCount[];

      return roleIds.map((id) => {
        const groupRole = groupRoles.find((role: GroupRole) => role.id === id);
        if (!groupRole) {
          return new Error(`Could not load role member count: ${id}`);
        }
        return groupRole.memberCount;
      });
    });
  }

  private _createServerRoleMemberCountLoader() {
    return this._getDataLoader<number, number>(async (roleIds) => {
      const serverRoles = (await this.serverRoleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.members', 'roleMember')
        .loadRelationCountAndMap('role.memberCount', 'role.members')
        .select(['role.id'])
        .whereInIds(roleIds)
        .getMany()) as ServerRoleWithMemberCount[];

      return roleIds.map((id) => {
        const serverRole = serverRoles.find(
          (role: ServerRole) => role.id === id,
        );
        if (!serverRole) {
          return new Error(`Could not load role member count: ${id}`);
        }
        return serverRole.memberCount;
      });
    });
  }

  private _createMyGroupPermissionsLoader() {
    return this._getDataLoader<MyGroupsKey, GroupPermissions, number>(
      async (keys) => {
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
      },
      { cacheKeyFn: (key) => key.groupId },
    );
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  private _createEventCoverPhotosLoader() {
    return this._getDataLoader<number, Image>(async (eventIds) => {
      const coverPhotos = await this.imageRepository.find({
        where: { eventId: In(eventIds), imageType: ImageTypes.CoverPhoto },
      });
      const mappedEventCoverPhotos = eventIds.map(
        (id) =>
          coverPhotos.find((coverPhoto: Image) => coverPhoto.eventId === id) ||
          new Error(`Could not load cover photo for event: ${id}`),
      );
      return mappedEventCoverPhotos;
    });
  }

  private _createEventsLoader() {
    return this._getDataLoader<number, Event>(async (eventIds) => {
      const events = await this.eventRepository.find({
        where: { id: In(eventIds) },
      });
      return eventIds.map(
        (id) =>
          events.find((event: Event) => event.id === id) ||
          new Error(`Could not load event: ${id}`),
      );
    });
  }

  private _createInterestedCountLoader() {
    return this._getDataLoader<number, number>(async (eventIds) => {
      const events = (await this.eventRepository
        .createQueryBuilder('event')
        .loadRelationCountAndMap(
          'event.interestedCount',
          'event.attendees',
          'eventAttendee',
          (qb) =>
            qb.where('eventAttendee.status = :status', {
              status: EventAttendeeStatus.Interested,
            }),
        )
        .select(['event.id'])
        .whereInIds(eventIds)
        .getMany()) as EventWithInterestedCount[];

      return eventIds.map((id) => {
        const event = events.find((event: Event) => event.id === id);
        if (!event) {
          return new Error(`Could not load interested count for event: ${id}`);
        }
        return event.interestedCount;
      });
    });
  }

  private _createGoingCountLoader() {
    return this._getDataLoader<number, number>(async (eventIds) => {
      const events = (await this.eventRepository
        .createQueryBuilder('event')
        .loadRelationCountAndMap(
          'event.goingCount',
          'event.attendees',
          'eventAttendee',
          (qb) =>
            qb.where('eventAttendee.status = :status', {
              status: EventAttendeeStatus.Going,
            }),
        )
        .select(['event.id'])
        .whereInIds(eventIds)
        .getMany()) as EventWithGoingCount[];

      return eventIds.map((id) => {
        const event = events.find((event: Event) => event.id === id);
        if (!event) {
          return new Error(`Could not load going count for event: ${id}`);
        }
        return event.goingCount;
      });
    });
  }

  // -------------------------------------------------------------------------
  // Questions & Answers
  // -------------------------------------------------------------------------

  private _createQuestionsLoader() {
    return this._getDataLoader<number, Question>(async (questionIds) => {
      const questions = await this.questionRepository.find({
        where: { id: In(questionIds) },
      });
      return questionIds.map(
        (id) =>
          questions.find((question: Question) => question.id === id) ||
          new Error(`Could not load question: ${id}`),
      );
    });
  }

  private _createQuestionnaireTicketLoader() {
    return this._getDataLoader<number, QuestionnaireTicket>(
      async (questionnaireTicketIds) => {
        const questionnaireTicket =
          await this.questionnaireTicketRepository.find({
            where: { id: In(questionnaireTicketIds) },
          });
        return questionnaireTicketIds.map(
          (id) =>
            questionnaireTicket.find(
              (questionnaireTicket: QuestionnaireTicket) =>
                questionnaireTicket.id === id,
            ) || new Error(`Could not load questionnaire ticket: ${id}`),
        );
      },
    );
  }

  private _createIsAnswerLikedByMeLoader() {
    return this._getDataLoader<IsQuestionLikedByMeKey, boolean, number>(
      async (keys) => {
        const questionIds = keys.map(({ questionId }) => questionId);
        const likes = await this.likeRepository.find({
          where: {
            questionId: In(questionIds),
            userId: keys[0].currentUserId,
          },
        });
        return questionIds.map((questionId) =>
          likes.some((like: Like) => like.questionId === questionId),
        );
      },
      { cacheKeyFn: (key) => key.questionId },
    );
  }
}
