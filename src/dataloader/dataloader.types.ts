import DataLoader from "dataloader";
import { GroupMember } from "../groups/group-members/models/group-member.model";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { Like } from "../likes/models/like.model";
import { ProposalAction } from "../proposals/proposal-actions/models/proposal-action.model";
import { User } from "../users/models/user.model";
import { Vote } from "../votes/models/vote.model";

export interface IsLikedByMeKey {
  userId: number;
  postId: number;
}

export interface Dataloaders {
  // Proposals & Votes
  proposalActionsLoader: DataLoader<number, ProposalAction>;
  proposalImagesLoader: DataLoader<number, Image[]>;
  proposalVoteCountLoader: DataLoader<number, number>;
  proposalVotesLoader: DataLoader<number, Vote[]>;

  // Posts
  isPostLikedByMeLoader: DataLoader<IsLikedByMeKey, boolean>;
  postImagesLoader: DataLoader<number, Image[]>;
  postLikeCountLoader: DataLoader<number, number>;
  postLikesLoader: DataLoader<number, Like[]>;

  // Groups
  groupCoverPhotosLoader: DataLoader<number, Image>;
  groupMemberCountLoader: DataLoader<number, number>;
  groupMembersLoader: DataLoader<number, GroupMember[]>;
  groupsLoader: DataLoader<number, Group>;
  memberRequestCountLoader: DataLoader<number, number>;

  // Misc.
  profilePicturesLoader: DataLoader<number, Image>;
  roleMemberCountLoader: DataLoader<number, number>;
  usersLoader: DataLoader<number, User>;
}
