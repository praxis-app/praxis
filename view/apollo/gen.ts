// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Upload: any;
};

export type ApproveGroupMemberRequestPayload = {
  __typename?: 'ApproveGroupMemberRequestPayload';
  groupMember: User;
};

export type Comment = {
  __typename?: 'Comment';
  body?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  images: Array<Image>;
  likes: Array<Like>;
  post?: Maybe<Post>;
  proposal?: Maybe<Proposal>;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type CreateCommentInput = {
  body?: InputMaybe<Scalars['String']>;
  images?: InputMaybe<Array<Scalars['Upload']>>;
  postId?: InputMaybe<Scalars['Int']>;
  proposalId?: InputMaybe<Scalars['Int']>;
};

export type CreateCommentPayload = {
  __typename?: 'CreateCommentPayload';
  comment: Comment;
};

export type CreateEventAttendeeInput = {
  eventId: Scalars['Int'];
  status: Scalars['String'];
};

export type CreateEventAttendeePayload = {
  __typename?: 'CreateEventAttendeePayload';
  event: Event;
};

export type CreateEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  description: Scalars['String'];
  endsAt?: InputMaybe<Scalars['DateTime']>;
  externalLink?: InputMaybe<Scalars['String']>;
  groupId?: InputMaybe<Scalars['Int']>;
  hostId: Scalars['Int'];
  location?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  online?: InputMaybe<Scalars['Boolean']>;
  startsAt: Scalars['DateTime'];
};

export type CreateEventPayload = {
  __typename?: 'CreateEventPayload';
  event: Event;
};

export type CreateGroupInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  description: Scalars['String'];
  name: Scalars['String'];
};

export type CreateGroupMemberRequestPayload = {
  __typename?: 'CreateGroupMemberRequestPayload';
  groupMemberRequest: GroupMemberRequest;
};

export type CreateGroupPayload = {
  __typename?: 'CreateGroupPayload';
  group: Group;
};

export type CreateGroupRoleInput = {
  color: Scalars['String'];
  groupId: Scalars['Int'];
  name: Scalars['String'];
};

export type CreateGroupRolePayload = {
  __typename?: 'CreateGroupRolePayload';
  groupRole: GroupRole;
};

export type CreateLikeInput = {
  postId?: InputMaybe<Scalars['Int']>;
};

export type CreateLikePayload = {
  __typename?: 'CreateLikePayload';
  like: Like;
};

export type CreatePostInput = {
  body?: InputMaybe<Scalars['String']>;
  eventId?: InputMaybe<Scalars['Int']>;
  groupId?: InputMaybe<Scalars['Int']>;
  images?: InputMaybe<Array<Scalars['Upload']>>;
};

export type CreatePostPayload = {
  __typename?: 'CreatePostPayload';
  post: Post;
};

export type CreateProposalInput = {
  action: ProposalActionInput;
  body?: InputMaybe<Scalars['String']>;
  groupId?: InputMaybe<Scalars['Int']>;
  images?: InputMaybe<Array<Scalars['Upload']>>;
};

export type CreateProposalPayload = {
  __typename?: 'CreateProposalPayload';
  proposal: Proposal;
};

export type CreateServerInviteInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']>;
  maxUses?: InputMaybe<Scalars['Int']>;
};

export type CreateServerInvitePayload = {
  __typename?: 'CreateServerInvitePayload';
  serverInvite: ServerInvite;
};

export type CreateServerRoleInput = {
  color: Scalars['String'];
  name: Scalars['String'];
};

export type CreateServerRolePayload = {
  __typename?: 'CreateServerRolePayload';
  serverRole: ServerRole;
};

export type CreateVoteInput = {
  proposalId: Scalars['Int'];
  voteType: Scalars['String'];
};

export type CreateVotePayload = {
  __typename?: 'CreateVotePayload';
  vote: Vote;
};

export type DeleteGroupRoleMemberInput = {
  groupRoleId: Scalars['Int'];
  userId: Scalars['Int'];
};

export type DeleteGroupRoleMemberPayload = {
  __typename?: 'DeleteGroupRoleMemberPayload';
  groupRole: GroupRole;
};

export type DeleteLikeInput = {
  postId?: InputMaybe<Scalars['Int']>;
};

export type DeleteServerRoleMemberInput = {
  serverRoleId: Scalars['Int'];
  userId: Scalars['Int'];
};

export type DeleteServerRoleMemberPayload = {
  __typename?: 'DeleteServerRoleMemberPayload';
  me: User;
  serverRole: ServerRole;
};

export type Event = {
  __typename?: 'Event';
  attendees: Array<EventAttendee>;
  attendingStatus?: Maybe<Scalars['String']>;
  coverPhoto: Image;
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  endsAt?: Maybe<Scalars['DateTime']>;
  externalLink?: Maybe<Scalars['String']>;
  goingCount: Scalars['Int'];
  group?: Maybe<Group>;
  host: User;
  id: Scalars['Int'];
  images: Array<Image>;
  interestedCount: Scalars['Int'];
  location?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  online: Scalars['Boolean'];
  posts: Array<Post>;
  startsAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type EventAttendee = {
  __typename?: 'EventAttendee';
  createdAt: Scalars['DateTime'];
  event: Event;
  id: Scalars['Int'];
  status: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type EventsInput = {
  online?: InputMaybe<Scalars['Boolean']>;
  timeFrame?: InputMaybe<Scalars['String']>;
};

export type FeedItem = Post | Proposal;

export type FollowUserPayload = {
  __typename?: 'FollowUserPayload';
  followedUser: User;
  follower: User;
};

export type Group = {
  __typename?: 'Group';
  coverPhoto?: Maybe<Image>;
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  feed: Array<FeedItem>;
  futureEvents: Array<Event>;
  id: Scalars['Int'];
  isJoinedByMe: Scalars['Boolean'];
  memberCount: Scalars['Int'];
  memberRequestCount?: Maybe<Scalars['Int']>;
  memberRequests?: Maybe<Array<GroupMemberRequest>>;
  members: Array<User>;
  myPermissions: GroupPermissions;
  name: Scalars['String'];
  pastEvents: Array<Event>;
  posts: Array<Post>;
  proposals: Array<Proposal>;
  roles: Array<GroupRole>;
  settings: GroupConfig;
  updatedAt: Scalars['DateTime'];
};

export type GroupConfig = {
  __typename?: 'GroupConfig';
  createdAt: Scalars['DateTime'];
  group: Group;
  id: Scalars['Int'];
  isPublic: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
};

export type GroupMemberRequest = {
  __typename?: 'GroupMemberRequest';
  createdAt: Scalars['DateTime'];
  group: Group;
  id: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type GroupPermissions = {
  __typename?: 'GroupPermissions';
  approveMemberRequests: Scalars['Boolean'];
  createEvents: Scalars['Boolean'];
  deleteGroup: Scalars['Boolean'];
  manageComments: Scalars['Boolean'];
  manageEvents: Scalars['Boolean'];
  managePosts: Scalars['Boolean'];
  manageRoles: Scalars['Boolean'];
  manageSettings: Scalars['Boolean'];
  removeMembers: Scalars['Boolean'];
  updateGroup: Scalars['Boolean'];
};

export type GroupRole = {
  __typename?: 'GroupRole';
  availableUsersToAdd: Array<User>;
  color: Scalars['String'];
  group: Group;
  id: Scalars['Int'];
  memberCount: Scalars['Int'];
  members: Array<User>;
  name: Scalars['String'];
  permissions: GroupRolePermission;
  proposalActionRoles: Array<ProposalActionRole>;
};

export type GroupRolePermission = {
  __typename?: 'GroupRolePermission';
  approveMemberRequests: Scalars['Boolean'];
  createEvents: Scalars['Boolean'];
  deleteGroup: Scalars['Boolean'];
  groupRole: GroupRole;
  id: Scalars['Int'];
  manageComments: Scalars['Boolean'];
  manageEvents: Scalars['Boolean'];
  managePosts: Scalars['Boolean'];
  manageRoles: Scalars['Boolean'];
  manageSettings: Scalars['Boolean'];
  removeMembers: Scalars['Boolean'];
  updateGroup: Scalars['Boolean'];
};

export type GroupRolePermissionInput = {
  approveMemberRequests?: InputMaybe<Scalars['Boolean']>;
  createEvents?: InputMaybe<Scalars['Boolean']>;
  deleteGroup?: InputMaybe<Scalars['Boolean']>;
  manageComments?: InputMaybe<Scalars['Boolean']>;
  manageEvents?: InputMaybe<Scalars['Boolean']>;
  managePosts?: InputMaybe<Scalars['Boolean']>;
  manageRoles?: InputMaybe<Scalars['Boolean']>;
  manageSettings?: InputMaybe<Scalars['Boolean']>;
  removeMembers?: InputMaybe<Scalars['Boolean']>;
  updateGroup?: InputMaybe<Scalars['Boolean']>;
};

export type Image = {
  __typename?: 'Image';
  comment?: Maybe<Comment>;
  createdAt: Scalars['DateTime'];
  event?: Maybe<Event>;
  filename: Scalars['String'];
  group?: Maybe<Group>;
  id: Scalars['Int'];
  imageType: Scalars['String'];
  post?: Maybe<Post>;
  proposal?: Maybe<Proposal>;
  proposalAction?: Maybe<ProposalAction>;
  proposalActionEvent?: Maybe<ProposalActionEvent>;
  updatedAt: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type Like = {
  __typename?: 'Like';
  comment?: Maybe<Comment>;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  post?: Maybe<Post>;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type LoginInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approveGroupMemberRequest: ApproveGroupMemberRequestPayload;
  cancelGroupMemberRequest: Scalars['Boolean'];
  createComment: CreateCommentPayload;
  createEvent: CreateEventPayload;
  createEventAttendee: CreateEventAttendeePayload;
  createGroup: CreateGroupPayload;
  createGroupMemberRequest: CreateGroupMemberRequestPayload;
  createGroupRole: CreateGroupRolePayload;
  createLike: CreateLikePayload;
  createPost: CreatePostPayload;
  createProposal: CreateProposalPayload;
  createServerInvite: CreateServerInvitePayload;
  createServerRole: CreateServerRolePayload;
  createVote: CreateVotePayload;
  deleteComment: Scalars['Boolean'];
  deleteEvent: Scalars['Boolean'];
  deleteEventAttendee: Scalars['Boolean'];
  deleteGroup: Scalars['Boolean'];
  deleteGroupRole: Scalars['Boolean'];
  deleteGroupRoleMember: DeleteGroupRoleMemberPayload;
  deleteImage: Scalars['Boolean'];
  deleteLike: Scalars['Boolean'];
  deletePost: Scalars['Boolean'];
  deleteProposal: Scalars['Boolean'];
  deleteServerInvite: Scalars['Boolean'];
  deleteServerRole: Scalars['Boolean'];
  deleteServerRoleMember: DeleteServerRoleMemberPayload;
  deleteUser: Scalars['Boolean'];
  deleteVote: Scalars['Boolean'];
  denyGroupMemberRequest: Scalars['Boolean'];
  followUser: FollowUserPayload;
  leaveGroup: Scalars['Boolean'];
  logOut: Scalars['Boolean'];
  login: Scalars['Boolean'];
  refreshToken: Scalars['Boolean'];
  signUp: Scalars['Boolean'];
  unfollowUser: Scalars['Boolean'];
  updateComment: UpdateCommentPayload;
  updateEvent: UpdateEventPayload;
  updateEventAttendee: UpdateEventAttendeePayload;
  updateGroup: UpdateGroupPayload;
  updateGroupConfig: UpdateGroupPayload;
  updateGroupRole: UpdateGroupRolePayload;
  updatePost: UpdatePostPayload;
  updateProposal: UpdateProposalPayload;
  updateServerRole: UpdateServerRolePayload;
  updateUser: UpdateUserPayload;
  updateVote: UpdateVotePayload;
};

export type MutationApproveGroupMemberRequestArgs = {
  id: Scalars['Int'];
};

export type MutationCancelGroupMemberRequestArgs = {
  id: Scalars['Int'];
};

export type MutationCreateCommentArgs = {
  commentData: CreateCommentInput;
};

export type MutationCreateEventArgs = {
  eventData: CreateEventInput;
};

export type MutationCreateEventAttendeeArgs = {
  eventAttendeeData: CreateEventAttendeeInput;
};

export type MutationCreateGroupArgs = {
  groupData: CreateGroupInput;
};

export type MutationCreateGroupMemberRequestArgs = {
  groupId: Scalars['Int'];
};

export type MutationCreateGroupRoleArgs = {
  groupRoleData: CreateGroupRoleInput;
};

export type MutationCreateLikeArgs = {
  likeData: CreateLikeInput;
};

export type MutationCreatePostArgs = {
  postData: CreatePostInput;
};

export type MutationCreateProposalArgs = {
  proposalData: CreateProposalInput;
};

export type MutationCreateServerInviteArgs = {
  serverInviteData: CreateServerInviteInput;
};

export type MutationCreateServerRoleArgs = {
  serverRoleData: CreateServerRoleInput;
};

export type MutationCreateVoteArgs = {
  voteData: CreateVoteInput;
};

export type MutationDeleteCommentArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteEventArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteEventAttendeeArgs = {
  eventId: Scalars['Int'];
};

export type MutationDeleteGroupArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteGroupRoleArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteGroupRoleMemberArgs = {
  groupRoleMemberData: DeleteGroupRoleMemberInput;
};

export type MutationDeleteImageArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteLikeArgs = {
  likeData: DeleteLikeInput;
};

export type MutationDeletePostArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteProposalArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteServerInviteArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteServerRoleArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteServerRoleMemberArgs = {
  serverRoleMemberData: DeleteServerRoleMemberInput;
};

export type MutationDeleteUserArgs = {
  id: Scalars['Int'];
};

export type MutationDeleteVoteArgs = {
  id: Scalars['Int'];
};

export type MutationDenyGroupMemberRequestArgs = {
  id: Scalars['Int'];
};

export type MutationFollowUserArgs = {
  id: Scalars['Int'];
};

export type MutationLeaveGroupArgs = {
  id: Scalars['Int'];
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type MutationUnfollowUserArgs = {
  id: Scalars['Int'];
};

export type MutationUpdateCommentArgs = {
  commentData: UpdateCommentInput;
};

export type MutationUpdateEventArgs = {
  eventData: UpdateEventInput;
};

export type MutationUpdateEventAttendeeArgs = {
  eventAttendeeData: UpdateEventAttendeeInput;
};

export type MutationUpdateGroupArgs = {
  groupData: UpdateGroupInput;
};

export type MutationUpdateGroupConfigArgs = {
  groupConfigData: UpdateGroupConfigInput;
};

export type MutationUpdateGroupRoleArgs = {
  groupRoleData: UpdateGroupRoleInput;
};

export type MutationUpdatePostArgs = {
  postData: UpdatePostInput;
};

export type MutationUpdateProposalArgs = {
  proposalData: UpdateProposalInput;
};

export type MutationUpdateServerRoleArgs = {
  serverRoleData: UpdateServerRoleInput;
};

export type MutationUpdateUserArgs = {
  userData: UpdateUserInput;
};

export type MutationUpdateVoteArgs = {
  voteData: UpdateVoteInput;
};

export type Post = {
  __typename?: 'Post';
  body?: Maybe<Scalars['String']>;
  commentCount: Scalars['Int'];
  comments: Array<Comment>;
  createdAt: Scalars['DateTime'];
  event?: Maybe<Event>;
  group?: Maybe<Group>;
  id: Scalars['Int'];
  images: Array<Image>;
  isLikedByMe: Scalars['Boolean'];
  likes: Array<Like>;
  likesCount: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type Proposal = {
  __typename?: 'Proposal';
  action: ProposalAction;
  body?: Maybe<Scalars['String']>;
  commentCount: Scalars['Int'];
  comments: Array<Comment>;
  createdAt: Scalars['DateTime'];
  group?: Maybe<Group>;
  id: Scalars['Int'];
  images: Array<Image>;
  stage: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  voteCount: Scalars['Int'];
  votes: Array<Vote>;
};

export type ProposalAction = {
  __typename?: 'ProposalAction';
  actionType: Scalars['String'];
  createdAt: Scalars['DateTime'];
  event?: Maybe<ProposalActionEvent>;
  groupCoverPhoto?: Maybe<Image>;
  groupDescription?: Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  proposal: Proposal;
  role?: Maybe<ProposalActionRole>;
  updatedAt: Scalars['DateTime'];
};

export type ProposalActionEvent = {
  __typename?: 'ProposalActionEvent';
  coverPhoto?: Maybe<Image>;
  description: Scalars['String'];
  endsAt?: Maybe<Scalars['DateTime']>;
  externalLink?: Maybe<Scalars['String']>;
  host: User;
  hosts: Array<ProposalActionEventHost>;
  id: Scalars['Int'];
  location?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  online: Scalars['Boolean'];
  proposalAction: ProposalAction;
  startsAt: Scalars['DateTime'];
};

export type ProposalActionEventHost = {
  __typename?: 'ProposalActionEventHost';
  createdAt: Scalars['DateTime'];
  event: ProposalActionEvent;
  id: Scalars['Int'];
  status: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type ProposalActionEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  description: Scalars['String'];
  endsAt?: InputMaybe<Scalars['DateTime']>;
  externalLink?: InputMaybe<Scalars['String']>;
  hostId: Scalars['Int'];
  location?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  online?: InputMaybe<Scalars['Boolean']>;
  startsAt: Scalars['DateTime'];
};

export type ProposalActionInput = {
  actionType: Scalars['String'];
  event?: InputMaybe<ProposalActionEventInput>;
  groupCoverPhoto?: InputMaybe<Scalars['Upload']>;
  groupDescription?: InputMaybe<Scalars['String']>;
  groupName?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<ProposalActionRoleInput>;
};

export type ProposalActionPermission = {
  __typename?: 'ProposalActionPermission';
  approveMemberRequests?: Maybe<Scalars['Boolean']>;
  createEvents?: Maybe<Scalars['Boolean']>;
  deleteGroup?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  manageComments?: Maybe<Scalars['Boolean']>;
  manageEvents?: Maybe<Scalars['Boolean']>;
  managePosts?: Maybe<Scalars['Boolean']>;
  manageRoles?: Maybe<Scalars['Boolean']>;
  manageSettings?: Maybe<Scalars['Boolean']>;
  removeMembers?: Maybe<Scalars['Boolean']>;
  role: ProposalActionRole;
  updateGroup?: Maybe<Scalars['Boolean']>;
};

export type ProposalActionRole = {
  __typename?: 'ProposalActionRole';
  color?: Maybe<Scalars['String']>;
  groupRole?: Maybe<GroupRole>;
  id: Scalars['Int'];
  members?: Maybe<Array<ProposalActionRoleMember>>;
  name?: Maybe<Scalars['String']>;
  oldColor?: Maybe<Scalars['String']>;
  oldName?: Maybe<Scalars['String']>;
  permissions: ProposalActionPermission;
  proposalAction: ProposalAction;
};

export type ProposalActionRoleInput = {
  color?: InputMaybe<Scalars['String']>;
  members?: InputMaybe<Array<ProposalActionRoleMemberInput>>;
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<GroupRolePermissionInput>;
  roleToUpdateId?: InputMaybe<Scalars['Int']>;
};

export type ProposalActionRoleMember = {
  __typename?: 'ProposalActionRoleMember';
  changeType: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  role: ProposalActionRole;
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type ProposalActionRoleMemberInput = {
  changeType: Scalars['String'];
  userId: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  authCheck: Scalars['Boolean'];
  event: Event;
  events: Array<Event>;
  group: Group;
  groupMemberRequest?: Maybe<GroupMemberRequest>;
  groupRole: GroupRole;
  groupRoles: Array<GroupRole>;
  groups: Array<Group>;
  isFirstUser: Scalars['Boolean'];
  me: User;
  post: Post;
  proposal: Proposal;
  publicGroups: Array<Group>;
  publicGroupsFeed: Array<FeedItem>;
  serverInvite: ServerInvite;
  serverInvites: Array<ServerInvite>;
  serverRole: ServerRole;
  serverRoles: Array<ServerRole>;
  user: User;
  users: Array<User>;
  usersByIds: Array<User>;
};

export type QueryEventArgs = {
  id?: InputMaybe<Scalars['Int']>;
};

export type QueryEventsArgs = {
  input: EventsInput;
};

export type QueryGroupArgs = {
  id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export type QueryGroupMemberRequestArgs = {
  groupId: Scalars['Int'];
};

export type QueryGroupRoleArgs = {
  id: Scalars['Int'];
};

export type QueryPostArgs = {
  id: Scalars['Int'];
};

export type QueryProposalArgs = {
  id: Scalars['Int'];
};

export type QueryServerInviteArgs = {
  token: Scalars['String'];
};

export type QueryServerRoleArgs = {
  id: Scalars['Int'];
};

export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export type QueryUsersByIdsArgs = {
  ids: Array<Scalars['Int']>;
};

export type ServerInvite = {
  __typename?: 'ServerInvite';
  createdAt: Scalars['DateTime'];
  expiresAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  maxUses?: Maybe<Scalars['Int']>;
  token: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  uses: Scalars['Int'];
};

export type ServerPermissions = {
  __typename?: 'ServerPermissions';
  createInvites: Scalars['Boolean'];
  manageComments: Scalars['Boolean'];
  manageEvents: Scalars['Boolean'];
  manageInvites: Scalars['Boolean'];
  managePosts: Scalars['Boolean'];
  manageRoles: Scalars['Boolean'];
  removeMembers: Scalars['Boolean'];
};

export type ServerRole = {
  __typename?: 'ServerRole';
  availableUsersToAdd: Array<User>;
  color: Scalars['String'];
  id: Scalars['Int'];
  memberCount: Scalars['Int'];
  members: Array<User>;
  name: Scalars['String'];
  permissions: ServerRolePermission;
};

export type ServerRolePermission = {
  __typename?: 'ServerRolePermission';
  createInvites: Scalars['Boolean'];
  id: Scalars['Int'];
  manageComments: Scalars['Boolean'];
  manageEvents: Scalars['Boolean'];
  manageInvites: Scalars['Boolean'];
  managePosts: Scalars['Boolean'];
  manageRoles: Scalars['Boolean'];
  removeMembers: Scalars['Boolean'];
  serverRole: ServerRole;
};

export type ServerRolePermissionInput = {
  createInvites?: InputMaybe<Scalars['Boolean']>;
  manageComments?: InputMaybe<Scalars['Boolean']>;
  manageEvents?: InputMaybe<Scalars['Boolean']>;
  manageInvites?: InputMaybe<Scalars['Boolean']>;
  managePosts?: InputMaybe<Scalars['Boolean']>;
  manageRoles?: InputMaybe<Scalars['Boolean']>;
  removeMembers?: InputMaybe<Scalars['Boolean']>;
};

export type SignUpInput = {
  confirmPassword: Scalars['String'];
  email: Scalars['String'];
  inviteToken?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  password: Scalars['String'];
  profilePicture?: InputMaybe<Scalars['Upload']>;
};

export type UpdateCommentInput = {
  body?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  images?: InputMaybe<Array<Scalars['Upload']>>;
};

export type UpdateCommentPayload = {
  __typename?: 'UpdateCommentPayload';
  comment: Comment;
};

export type UpdateEventAttendeeInput = {
  eventId: Scalars['Int'];
  status: Scalars['String'];
};

export type UpdateEventAttendeePayload = {
  __typename?: 'UpdateEventAttendeePayload';
  event: Event;
};

export type UpdateEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  description: Scalars['String'];
  endsAt?: InputMaybe<Scalars['DateTime']>;
  externalLink?: InputMaybe<Scalars['String']>;
  hostId?: InputMaybe<Scalars['Int']>;
  id: Scalars['Int'];
  location?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  online?: InputMaybe<Scalars['Boolean']>;
  startsAt: Scalars['DateTime'];
};

export type UpdateEventPayload = {
  __typename?: 'UpdateEventPayload';
  event: Event;
};

export type UpdateGroupConfigInput = {
  groupId: Scalars['Int'];
  privacy?: InputMaybe<Scalars['String']>;
};

export type UpdateGroupInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  description?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateGroupPayload = {
  __typename?: 'UpdateGroupPayload';
  group: Group;
};

export type UpdateGroupRoleInput = {
  color?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<GroupRolePermissionInput>;
  selectedUserIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type UpdateGroupRolePayload = {
  __typename?: 'UpdateGroupRolePayload';
  groupRole: GroupRole;
};

export type UpdatePostInput = {
  body?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  images?: InputMaybe<Array<Scalars['Upload']>>;
};

export type UpdatePostPayload = {
  __typename?: 'UpdatePostPayload';
  post: Post;
};

export type UpdateProposalInput = {
  action: ProposalActionInput;
  body?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  images?: InputMaybe<Array<Scalars['Upload']>>;
};

export type UpdateProposalPayload = {
  __typename?: 'UpdateProposalPayload';
  proposal: Proposal;
};

export type UpdateServerRoleInput = {
  color?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<ServerRolePermissionInput>;
  selectedUserIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type UpdateServerRolePayload = {
  __typename?: 'UpdateServerRolePayload';
  me: User;
  serverRole: ServerRole;
};

export type UpdateUserInput = {
  bio: Scalars['String'];
  coverPhoto?: InputMaybe<Scalars['Upload']>;
  id: Scalars['Int'];
  name: Scalars['String'];
  profilePicture?: InputMaybe<Scalars['Upload']>;
};

export type UpdateUserPayload = {
  __typename?: 'UpdateUserPayload';
  user: User;
};

export type UpdateVoteInput = {
  id: Scalars['Int'];
  voteType: Scalars['String'];
};

export type UpdateVotePayload = {
  __typename?: 'UpdateVotePayload';
  vote: Vote;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']>;
  comments: Array<Comment>;
  coverPhoto?: Maybe<Image>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  followerCount: Scalars['Int'];
  followers: Array<User>;
  following: Array<User>;
  followingCount: Scalars['Int'];
  homeFeed: Array<FeedItem>;
  id: Scalars['Int'];
  isFollowedByMe: Scalars['Boolean'];
  joinedGroups: Array<Group>;
  likes: Array<Like>;
  name: Scalars['String'];
  posts: Array<Post>;
  profileFeed: Array<FeedItem>;
  profilePicture: Image;
  proposals: Array<Proposal>;
  serverPermissions: ServerPermissions;
  updatedAt: Scalars['DateTime'];
};

export type Vote = {
  __typename?: 'Vote';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  proposal: Proposal;
  updatedAt: Scalars['DateTime'];
  user: User;
  voteType: Scalars['String'];
};
