/**
 * TODO: Determine whether data loaders should be renamed to more
 * clearly indicate whether IDs are being mapped to one or many
 */

import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { CommentsService } from '../comments/comments.service';
import { EventsService } from '../events/events.service';
import { Event } from '../events/models/event.model';
import { GroupMemberRequestsService } from '../groups/group-member-requests/group-member-requests.service';
import { GroupRolesService } from '../groups/group-roles/group-roles.service';
import { GroupPermissions } from '../groups/group-roles/models/group-permissions.type';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { PostsService } from '../posts/posts.service';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { ProposalActionsService } from '../proposals/proposal-actions/proposal-actions.service';
import { ProposalsService } from '../proposals/proposals.service';
import { ServerRolesService } from '../server-roles/server-roles.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { Vote } from '../votes/models/vote.model';
import { VotesService } from '../votes/votes.service';
import {
  Dataloaders,
  IsFollowedByMeKey,
  IsLikedByMeKey,
  MyGroupsKey,
} from './dataloader.types';

@Injectable()
export class DataloaderService {
  constructor(
    private commentsService: CommentsService,
    private eventsService: EventsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private memberRequestsService: GroupMemberRequestsService,
    private postsService: PostsService,
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
    private serverRolesService: ServerRolesService,
    private usersService: UsersService,
    private votesService: VotesService,
  ) {}

  getLoaders(): Dataloaders {
    return {
      // Proposals & Votes
      proposalActionsLoader: this._createProposalActionsLoader(),
      proposalImagesLoader: this._createProposalImagesLoader(),
      proposalVoteCountLoader: this._createProposalVoteCountLoader(),
      proposalVotesLoader: this._createProposalVotesLoader(),
      proposalCommentCountLoader: this._createProposalCommentCountLoader(),

      // Posts
      isPostLikedByMeLoader: this._createIsPostLikedByMeLoader(),
      postCommentCountLoader: this._createPostCommentCountLoader(),
      postImagesLoader: this._createPostImagesLoader(),
      postLikeCountLoader: this._createPostLikeCountLoader(),
      postLikesLoader: this._createPostLikesLoader(),

      // Comments
      commentImagesLoader: this._createCommentImagesLoader(),

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
    };
  }

  /**
   * Creates a new dataloader with the given batch function and options.
   *
   * Passing a custom batch schedule function enables dataloader to work
   * with asyncronous middleware.
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

  private _createProposalVotesLoader() {
    return this._getDataLoader<number, Vote[]>(async (proposalIds) =>
      this.proposalsService.getProposalVotesBatch(proposalIds as number[]),
    );
  }

  private _createProposalVoteCountLoader() {
    return this._getDataLoader<number, number>(async (proposalIds) =>
      this.votesService.getVoteCountBatch(proposalIds as number[]),
    );
  }

  private _createProposalImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (proposalIds) =>
      this.proposalsService.getProposalImagesBatch(proposalIds as number[]),
    );
  }

  private _createProposalActionsLoader() {
    return this._getDataLoader<number, ProposalAction>(
      async (proposalActionIds) =>
        this.proposalActionsService.getProposalActionsBatch(
          proposalActionIds as number[],
        ),
    );
  }

  private _createProposalCommentCountLoader() {
    return this._getDataLoader<number, number>(async (proposalIds) =>
      this.proposalsService.getProposalCommentCountBatch(
        proposalIds as number[],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Posts
  // -------------------------------------------------------------------------

  private _createIsPostLikedByMeLoader() {
    return this._getDataLoader<IsLikedByMeKey, boolean, number>(
      async (keys) =>
        this.postsService.getIsLikedByMeBatch(keys as IsLikedByMeKey[]),
      { cacheKeyFn: (key) => key.postId },
    );
  }

  private _createPostImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (postIds) =>
      this.postsService.getPostImagesBatch(postIds as number[]),
    );
  }

  private _createPostLikesLoader() {
    return this._getDataLoader<number, Like[]>(async (postIds) =>
      this.postsService.getPostLikesBatch(postIds as number[]),
    );
  }

  private _createPostLikeCountLoader() {
    return this._getDataLoader<number, number>(async (postIds) =>
      this.postsService.getLikesCountBatch(postIds as number[]),
    );
  }

  private _createPostCommentCountLoader() {
    return this._getDataLoader<number, number>(async (postIds) =>
      this.postsService.getPostCommentCountBatch(postIds as number[]),
    );
  }

  // -------------------------------------------------------------------------
  // Comments
  // -------------------------------------------------------------------------

  private _createCommentImagesLoader() {
    return this._getDataLoader<number, Image[]>(async (commentIds) =>
      this.commentsService.getCommentImagesBatch(commentIds as number[]),
    );
  }

  // -------------------------------------------------------------------------
  // Groups
  // -------------------------------------------------------------------------

  private _createGroupsLoader() {
    return this._getDataLoader<number, Group>(async (groupIds) =>
      this.groupsService.getGroupsBatch(groupIds as number[]),
    );
  }

  private _createGroupCoverPhotosLoader() {
    return this._getDataLoader<number, Image>(async (groupIds) =>
      this.groupsService.getCoverPhotosBatch(groupIds as number[]),
    );
  }

  private _createMemberRequestCountLoader() {
    return this._getDataLoader<number, number>(async (groupIds) =>
      this.memberRequestsService.getGroupMemberRequestCountBatch(
        groupIds as number[],
      ),
    );
  }

  private _createGroupMemberCountLoader() {
    return this._getDataLoader<number, number>(async (groupIds) =>
      this.groupsService.getGroupMemberCountBatch(groupIds as number[]),
    );
  }

  private _createGroupMembersLoader() {
    return this._getDataLoader<number, User[]>(async (groupIds) =>
      this.groupsService.getGroupMembersBatch(groupIds as number[]),
    );
  }

  private _createIsJoinedByMeLoader() {
    return this._getDataLoader<MyGroupsKey, boolean, number>(
      async (keys) =>
        this.groupsService.isJoinedByMeBatch(keys as MyGroupsKey[]),
      { cacheKeyFn: (key) => key.groupId },
    );
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  private _createFollowerCountLoader() {
    return this._getDataLoader<number, number>(async (userIds) =>
      this.usersService.getFollowerCountBatch(userIds as number[]),
    );
  }

  private _createFollowingCountLoader() {
    return this._getDataLoader<number, number>(async (userIds) =>
      this.usersService.getFollowingCountBatch(userIds as number[]),
    );
  }

  private _createIsFollowedByMeLoader() {
    return this._getDataLoader<IsFollowedByMeKey, boolean, number>(
      async (keys) =>
        this.usersService.getIsFollowedByMeBatch(keys as IsFollowedByMeKey[]),
      { cacheKeyFn: (key) => key.followedUserId },
    );
  }

  private _createUsersLoader() {
    return this._getDataLoader<number, User>(async (userIds) =>
      this.usersService.getUsersBatch(userIds as number[]),
    );
  }

  private _createProfilePicturesLoader() {
    return this._getDataLoader<number, Image>(async (userIds) =>
      this.usersService.getProfilePicturesBatch(userIds as number[]),
    );
  }

  // -------------------------------------------------------------------------
  // Roles & Permissions
  // -------------------------------------------------------------------------

  private _createGroupRoleMemberCountLoader() {
    return this._getDataLoader<number, number>(async (roleIds) =>
      this.groupRolesService.getGroupRoleMemberCountBatch(roleIds as number[]),
    );
  }

  private _createServerRoleMemberCountLoader() {
    return this._getDataLoader<number, number>(async (roleIds) =>
      this.serverRolesService.getServerRoleMemberCountBatch(
        roleIds as number[],
      ),
    );
  }

  private _createMyGroupPermissionsLoader() {
    return this._getDataLoader<MyGroupsKey, GroupPermissions, number>(
      async (keys) =>
        this.groupsService.getMyGroupPermissionsBatch(keys as MyGroupsKey[]),
      { cacheKeyFn: (key) => key.groupId },
    );
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  private _createEventCoverPhotosLoader() {
    return this._getDataLoader<number, Image>(async (eventIds) =>
      this.eventsService.getCoverPhotosBatch(eventIds as number[]),
    );
  }

  private _createEventsLoader() {
    return this._getDataLoader<number, Event>(async (eventIds) =>
      this.eventsService.getEventsBatch(eventIds as number[]),
    );
  }

  private _createInterestedCountLoader() {
    return this._getDataLoader<number, number>(async (eventIds) =>
      this.eventsService.getInterestedCountBatch(eventIds as number[]),
    );
  }

  private _createGoingCountLoader() {
    return this._getDataLoader<number, number>(async (eventIds) =>
      this.eventsService.getGoingCountBatch(eventIds as number[]),
    );
  }
}
