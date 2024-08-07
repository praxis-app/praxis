import DataLoader from 'dataloader';
import { Conversation } from '../chat/models/conversation.model';
import { Comment } from '../comments/models/comment.model';
import { Event } from '../events/models/event.model';
import { GroupPermissions } from '../groups/group-roles/models/group-permissions.type';
import { GroupRole } from '../groups/group-roles/models/group-role.model';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { ProposalAction } from '../proposals/proposal-actions/models/proposal-action.model';
import { ServerRole } from '../server-roles/models/server-role.model';
import { User } from '../users/models/user.model';
import { Question } from '../vibe-check/models/question.model';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
import { Vote } from '../votes/models/vote.model';

export interface IsPostLikedByMeKey {
  currentUserId: number;
  postId: number;
}

export interface IsCommentLikedByMeKey {
  currentUserId: number;
  commentId: number;
}

export interface IsQuestionLikedByMeKey {
  currentUserId: number;
  questionId: number;
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
  proposalsLoader: DataLoader<number, Proposal | null>;
  proposalActionsLoader: DataLoader<number, ProposalAction>;
  proposalCommentCountLoader: DataLoader<number, number>;
  proposalImagesLoader: DataLoader<number, Image[]>;
  proposalVoteCountLoader: DataLoader<number, number>;
  proposalVotesLoader: DataLoader<number, Vote[]>;
  proposalShareCountLoader: DataLoader<number, number>;

  // Posts
  postsLoader: DataLoader<number, Post | null>;
  isPostLikedByMeLoader: DataLoader<IsPostLikedByMeKey, boolean>;
  postCommentCountLoader: DataLoader<number, number>;
  postImagesLoader: DataLoader<number, Image[]>;
  postLikeCountLoader: DataLoader<number, number>;
  postLikesLoader: DataLoader<number, Like[]>;
  postShareCountLoader: DataLoader<number, number>;

  // Comments
  commentsLoader: DataLoader<number, Comment>;
  commentImagesLoader: DataLoader<number, Image[]>;
  commentLikeCountLoader: DataLoader<number, number>;
  commentLikesLoader: DataLoader<number, Like[]>;
  isCommentLikedByMeLoader: DataLoader<IsCommentLikedByMeKey, boolean>;

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

  // Chat
  conversationsLoader: DataLoader<number, Conversation>;
  messageImagesLoader: DataLoader<number, Image[]>;

  // Roles & Permissions
  groupRoleMemberCountLoader: DataLoader<number, number>;
  serverRoleMemberCountLoader: DataLoader<number, number>;
  myGroupPermissionsLoader: DataLoader<MyGroupsKey, GroupPermissions>;

  // Events
  eventCoverPhotosLoader: DataLoader<number, Image>;
  eventsLoader: DataLoader<number, Event>;
  interestedCountLoader: DataLoader<number, number>;
  goingCountLoader: DataLoader<number, number>;

  // Questions & Answers
  questionsLoader: DataLoader<number, Question>;
  questionnaireTicketsLoader: DataLoader<number, QuestionnaireTicket>;
  isAnswerLikedByMeLoader: DataLoader<IsQuestionLikedByMeKey, boolean>;
}

export type ServerRoleWithMemberCount = ServerRole & { memberCount: number };

export type UserWithFollowerCount = User & { followerCount: number };
export type UserWithFollowingCount = User & { followingCount: number };

export type ProposalWithVoteCount = Proposal & { voteCount: number };
export type ProposalWithCommentCount = Proposal & { commentCount: number };
export type ProposalWithShareCount = Proposal & { shareCount: number };

export type CommentWithLikeCount = Comment & { likeCount: number };
export type PostWithCommentCount = Post & { commentCount: number };
export type PostWithLikeCount = Post & { likeCount: number };
export type PostWithShareCount = Post & { shareCount: number };

export type EventWithInterestedCount = Event & { interestedCount: number };
export type EventWithGoingCount = Event & { goingCount: number };

export type GroupWithMemberCount = Group & { memberCount: number };
export type GroupRoleWithMemberCount = GroupRole & { memberCount: number };
export type GroupWithMemberRequestCount = Group & {
  memberRequestCount: number;
};
