/**
 * TODO: Determine whether data loaders should be renamed to more
 * clearly indicate whether IDs are being mapped to one or many
 */

import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { GroupMembersService } from "../groups/group-members/group-members.service";
import { GroupMember } from "../groups/group-members/models/group-member.model";
import { GroupsService } from "../groups/groups.service";
import { MemberRequestsService } from "../groups/member-requests/member-requests.service";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { PostsService } from "../posts/posts.service";
import { ProposalAction } from "../proposals/proposal-actions/models/proposal-action.model";
import { ProposalActionsService } from "../proposals/proposal-actions/proposal-actions.service";
import { ProposalsService } from "../proposals/proposals.service";
import { RoleMembersService } from "../roles/role-members/role-members.service";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { Vote } from "../votes/models/vote.model";
import { VotesService } from "../votes/votes.service";

export interface Dataloaders {
  // Proposals & Votes
  proposalActionsLoader: DataLoader<number, ProposalAction>;
  proposalImagesLoader: DataLoader<number, Image[]>;
  proposalVoteCountLoader: DataLoader<number, number>;
  proposalVotesLoader: DataLoader<number, Vote[]>;

  // Groups
  groupCoverPhotosLoader: DataLoader<number, Image>;
  groupMemberCountLoader: DataLoader<number, number>;
  groupMembersLoader: DataLoader<number, GroupMember[]>;
  groupsLoader: DataLoader<number, Group>;
  memberRequestCountLoader: DataLoader<number, number>;

  // Misc.
  postImagesLoader: DataLoader<number, Image[]>;
  profilePicturesLoader: DataLoader<number, Image>;
  roleMemberCountLoader: DataLoader<number, number>;
  usersLoader: DataLoader<number, User>;
}

@Injectable()
export class DataloaderService {
  constructor(
    private groupMembersService: GroupMembersService,
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
      // Proposals & votes
      proposalActionsLoader: this._createProposalActionsLoader(),
      proposalImagesLoader: this._createProposalImagesLoader(),
      proposalVoteCountLoader: this._createProposalVoteCountLoader(),
      proposalVotesLoader: this._createProposalVotesLoader(),

      // Groups
      groupCoverPhotosLoader: this._createGroupCoverPhotosLoader(),
      groupMemberCountLoader: this._createGroupMemberCountLoader(),
      groupMembersLoader: this._createGroupMembersLoader(),
      groupsLoader: this._createGroupsLoader(),
      memberRequestCountLoader: this._createMemberRequestCountLoader(),

      // Misc.
      postImagesLoader: this._createPostImagesLoader(),
      profilePicturesLoader: this._createProfilePicturesLoader(),
      roleMemberCountLoader: this._createRoleMemberCountLoader(),
      usersLoader: this._createUsersLoader(),
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
      this.groupMembersService.getGroupMemberCountByBatch(groupIds as number[])
    );
  }

  private _createGroupMembersLoader() {
    return new DataLoader<number, GroupMember[]>(async (groupIds) =>
      this.groupMembersService.getGroupMembersByBatch(groupIds as number[])
    );
  }

  // -------------------------------------------------------------------------
  // Misc.
  // -------------------------------------------------------------------------

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

  private _createPostImagesLoader() {
    return new DataLoader<number, Image[]>(async (postIds) =>
      this.postsService.getPostImagesByBatch(postIds as number[])
    );
  }

  private _createRoleMemberCountLoader() {
    return new DataLoader<number, number>(async (roleIds) =>
      this.roleMembersService.getRoleMemberCountByBatch(roleIds as number[])
    );
  }
}
