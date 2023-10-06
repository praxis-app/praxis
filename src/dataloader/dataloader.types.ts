import DataLoader from 'dataloader';
import { Event } from '../events/models/event.model';
import { GroupPermissions } from '../groups/group-roles/models/group-permissions.type';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';

export interface IsLikedByMeKey {
  currentUserId: number;
  postId: number;
}

export interface IsFollowedByMeKey {
  currentUserId: number;
  followedUserId: number;
}

export interface MyGroupsKey {
  currentUserId: number;
  groupId: number;
}

export interface Dataloaders {
  // Proposals & Votes
  proposalActionsLoader: DataLoader<number, ProposalAction>;
  proposalCommentCountLoader: DataLoader<number, number>;
  proposalImagesLoader: DataLoader<number, Image[]>;
  proposalVoteCountLoader: DataLoader<number, number>;
  proposalVotesLoader: DataLoader<number, Vote[]>;

  // Posts
  isPostLikedByMeLoader: DataLoader<IsLikedByMeKey, boolean>;
  postCommentCountLoader: DataLoader<number, number>;
  postImagesLoader: DataLoader<number, Image[]>;
  postLikeCountLoader: DataLoader<number, number>;
  postLikesLoader: DataLoader<number, Like[]>;

  // Comments
  commentImagesLoader: DataLoader<number, Image[]>;

  // Groups
  groupCoverPhotosLoader: DataLoader<number, Image>;
  groupMemberCountLoader: DataLoader<number, number>;
  groupMembersLoader: DataLoader<number, User[]>;
  groupsLoader: DataLoader<number, Group>;
  isJoinedByMeLoader: DataLoader<MyGroupsKey, boolean>;
  memberRequestCountLoader: DataLoader<number, number>;

  // Users
  isFollowedByMeLoader: DataLoader<IsFollowedByMeKey, boolean>;
  profilePicturesLoader: DataLoader<number, Image>;
  followerCountLoader: DataLoader<number, number>;
  followingCountLoader: DataLoader<number, number>;
  usersLoader: DataLoader<number, User>;

  // Roles & Permissions
  groupRoleMemberCountLoader: DataLoader<number, number>;
  serverRoleMemberCountLoader: DataLoader<number, number>;
  myGroupPermissionsLoader: DataLoader<MyGroupsKey, GroupPermissions>;

  // Events
  eventCoverPhotosLoader: DataLoader<number, Image>;
  eventsLoader: DataLoader<number, Event>;
  interestedCountLoader: DataLoader<number, number>;
  goingCountLoader: DataLoader<number, number>;
}
