/**
 * TODO: Determine whether data loaders should be renamed to more
 * clearly indicate whether IDs are being mapped to one or many
 */

import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { GroupsService } from "../groups/groups.service";
import { MemberRequestsService } from "../groups/member-requests/member-requests.service";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { Like } from "../likes/models/like.model";
import { PostsService } from "../posts/posts.service";
import { ProposalAction } from "../proposals/proposal-actions/models/proposal-action.model";
import { ProposalActionsService } from "../proposals/proposal-actions/proposal-actions.service";
import { ProposalsService } from "../proposals/proposals.service";
import { RoleMembersService } from "../roles/role-members/role-members.service";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { Vote } from "../votes/models/vote.model";
import { VotesService } from "../votes/votes.service";
import {
  Dataloaders,
  IsFollowedByMeKey,
  MyGroupsKey,
  IsLikedByMeKey,
} from "./dataloader.types";

@Injectable()
export class DataloaderService {
  constructor(
    private groupsService: GroupsService,
    private memberRequestsService: MemberRequestsService,
    private postsService: PostsService,
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
    private roleMembersService: RoleMembersService,
    private usersService: UsersService,
    private votesService: VotesService
  ) {}

  getLoaders(): Dataloaders {
    return {
      // Proposals & Votes
      proposalActionsLoader: this._createProposalActionsLoader(),
      proposalImagesLoader: this._createProposalImagesLoader(),
      proposalVoteCountLoader: this._createProposalVoteCountLoader(),
      proposalVotesLoader: this._createProposalVotesLoader(),

      // Posts
      isPostLikedByMeLoader: this._createIsPostLikedByMeLoader(),
      postImagesLoader: this._createPostImagesLoader(),
      postLikeCountLoader: this._createPostLikeCountLoader(),
      postLikesLoader: this._createPostLikesLoader(),

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
      roleMemberCountLoader: this._createRoleMemberCountLoader(),
      myGroupPermissionsLoader: this._createMyGroupPermissionsLoader(),
    };
  }

  // -------------------------------------------------------------------------
  // Proposals & Votes
  // -------------------------------------------------------------------------

  private _createProposalVotesLoader() {
    return new DataLoader<number, Vote[]>(async (proposalIds) =>
      this.proposalsService.getProposalVotesByBatch(proposalIds as number[])
    );
  }

  private _createProposalVoteCountLoader() {
    return new DataLoader<number, number>(async (proposalIds) =>
      this.votesService.getVoteCountByBatch(proposalIds as number[])
    );
  }

  private _createProposalImagesLoader() {
    return new DataLoader<number, Image[]>(async (proposalIds) =>
      this.proposalsService.getProposalImagesByBatch(proposalIds as number[])
    );
  }

  private _createProposalActionsLoader() {
    return new DataLoader<number, ProposalAction>(async (proposalActionIds) =>
      this.proposalActionsService.getProposalActionsByBatch(
        proposalActionIds as number[]
      )
    );
  }

  // -------------------------------------------------------------------------
  // Posts
  // -------------------------------------------------------------------------

  private _createIsPostLikedByMeLoader() {
    return new DataLoader<IsLikedByMeKey, boolean, number>(
      async (keys) =>
        this.postsService.getIsLikedByMeByBatch(keys as IsLikedByMeKey[]),
      { cacheKeyFn: (key) => key.postId }
    );
  }

  private _createPostImagesLoader() {
    return new DataLoader<number, Image[]>(async (postIds) =>
      this.postsService.getPostImagesByBatch(postIds as number[])
    );
  }

  private _createPostLikesLoader() {
    return new DataLoader<number, Like[]>(async (postIds) =>
      this.postsService.getPostLikesByBatch(postIds as number[])
    );
  }

  private _createPostLikeCountLoader() {
    return new DataLoader<number, number>(async (postIds) =>
      this.postsService.getLikesCountByBatch(postIds as number[])
    );
  }

  // -------------------------------------------------------------------------
  // Groups
  // -------------------------------------------------------------------------

  private _createGroupsLoader() {
    return new DataLoader<number, Group>(async (groupIds) =>
      this.groupsService.getGroupsByBatch(groupIds as number[])
    );
  }

  private _createGroupCoverPhotosLoader() {
    return new DataLoader<number, Image>(async (groupIds) =>
      this.groupsService.getCoverPhotosByBatch(groupIds as number[])
    );
  }

  private _createMemberRequestCountLoader() {
    return new DataLoader<number, number>(async (groupIds) =>
      this.memberRequestsService.getMemberRequestCountByBatch(
        groupIds as number[]
      )
    );
  }

  private _createGroupMemberCountLoader() {
    return new DataLoader<number, number>(async (groupIds) =>
      this.groupsService.getGroupMemberCountByBatch(groupIds as number[])
    );
  }

  private _createGroupMembersLoader() {
    return new DataLoader<number, User[]>(async (groupIds) =>
      this.groupsService.getGroupMembersByBatch(groupIds as number[])
    );
  }

  private _createIsJoinedByMeLoader() {
    return new DataLoader<MyGroupsKey, boolean, number>(
      async (keys) =>
        this.groupsService.isJoinedByMeByBatch(keys as MyGroupsKey[]),
      { cacheKeyFn: (key) => key.groupId }
    );
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  private _createFollowerCountLoader() {
    return new DataLoader<number, number>(async (userIds) =>
      this.usersService.getFollowerCountByBatch(userIds as number[])
    );
  }

  private _createFollowingCountLoader() {
    return new DataLoader<number, number>(async (userIds) =>
      this.usersService.getFollowingCountByBatch(userIds as number[])
    );
  }

  private _createIsFollowedByMeLoader() {
    return new DataLoader<IsFollowedByMeKey, boolean, number>(
      async (keys) =>
        this.usersService.getIsFollowedByMeByBatch(keys as IsFollowedByMeKey[]),
      { cacheKeyFn: (key) => key.followedUserId }
    );
  }

  private _createUsersLoader() {
    return new DataLoader<number, User>(async (userIds) =>
      this.usersService.getUsersByBatch(userIds as number[])
    );
  }

  private _createProfilePicturesLoader() {
    return new DataLoader<number, Image>(async (userIds) =>
      this.usersService.getProfilePicturesByBatch(userIds as number[])
    );
  }

  // -------------------------------------------------------------------------
  // Roles & Permissions
  // -------------------------------------------------------------------------

  private _createRoleMemberCountLoader() {
    return new DataLoader<number, number>(async (roleIds) =>
      this.roleMembersService.getRoleMemberCountByBatch(roleIds as number[])
    );
  }

  private _createMyGroupPermissionsLoader() {
    return new DataLoader<MyGroupsKey, string[], number>(
      async (keys) =>
        this.groupsService.getMyGroupPermissionsByBatch(keys as MyGroupsKey[]),
      { cacheKeyFn: (key) => key.groupId }
    );
  }
}
