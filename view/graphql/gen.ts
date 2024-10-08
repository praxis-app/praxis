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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: any; output: any };
  Upload: { input: any; output: any };
};

export type Answer = {
  __typename?: 'Answer';
  id: Scalars['Int']['output'];
  question: Question;
  text: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type AnswerInput = {
  questionId: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type AnswerQuestionsInput = {
  answers: Array<AnswerInput>;
  isSubmitting: Scalars['Boolean']['input'];
  questionnaireTicketId: Scalars['Int']['input'];
};

export type AnswerQuestionsPayload = {
  __typename?: 'AnswerQuestionsPayload';
  questionnaireTicket: QuestionnaireTicket;
};

export type ApproveGroupMemberRequestPayload = {
  __typename?: 'ApproveGroupMemberRequestPayload';
  groupMember: User;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  access_token: Scalars['String']['output'];
  isVerified: Scalars['Boolean']['output'];
};

export type Canary = {
  __typename?: 'Canary';
  id: Scalars['Int']['output'];
  statement: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  images: Array<Image>;
  isLikedByMe: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  likes: Array<Like>;
  post?: Maybe<Post>;
  proposal?: Maybe<Proposal>;
  question?: Maybe<Question>;
  questionnaireTicket?: Maybe<QuestionnaireTicket>;
  user: User;
};

export type Conversation = {
  __typename?: 'Conversation';
  createdAt: Scalars['DateTime']['output'];
  group?: Maybe<Group>;
  id: Scalars['Int']['output'];
  lastMessageSent?: Maybe<Message>;
  members: Array<User>;
  messages: Array<Message>;
  name: Scalars['String']['output'];
  unreadMessageCount: Scalars['Int']['output'];
};

export type ConversationMessagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateCommentInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
  postId?: InputMaybe<Scalars['Int']['input']>;
  proposalId?: InputMaybe<Scalars['Int']['input']>;
  questionId?: InputMaybe<Scalars['Int']['input']>;
  questionnaireTicketId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateCommentPayload = {
  __typename?: 'CreateCommentPayload';
  comment: Comment;
};

export type CreateEventAttendeeInput = {
  eventId: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};

export type CreateEventAttendeePayload = {
  __typename?: 'CreateEventAttendeePayload';
  event: Event;
};

export type CreateEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  externalLink?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['Int']['input']>;
  hostId: Scalars['Int']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  online?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt: Scalars['DateTime']['input'];
};

export type CreateEventPayload = {
  __typename?: 'CreateEventPayload';
  event: Event;
};

export type CreateGroupInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
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
  color: Scalars['String']['input'];
  groupId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type CreateGroupRolePayload = {
  __typename?: 'CreateGroupRolePayload';
  groupRole: GroupRole;
};

export type CreateLikeInput = {
  commentId?: InputMaybe<Scalars['Int']['input']>;
  postId?: InputMaybe<Scalars['Int']['input']>;
  questionId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateLikePayload = {
  __typename?: 'CreateLikePayload';
  comment?: Maybe<Comment>;
  like: Like;
  post?: Maybe<Post>;
  question?: Maybe<Question>;
};

export type CreatePostInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['Int']['input']>;
  groupId?: InputMaybe<Scalars['Int']['input']>;
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
  sharedFromUserId?: InputMaybe<Scalars['Int']['input']>;
  sharedPostId?: InputMaybe<Scalars['Int']['input']>;
  sharedProposalId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreatePostPayload = {
  __typename?: 'CreatePostPayload';
  post: Post;
};

export type CreateProposalInput = {
  action: ProposalActionInput;
  body?: InputMaybe<Scalars['String']['input']>;
  closingAt?: InputMaybe<Scalars['DateTime']['input']>;
  groupId?: InputMaybe<Scalars['Int']['input']>;
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
};

export type CreateProposalPayload = {
  __typename?: 'CreateProposalPayload';
  proposal: Proposal;
};

export type CreateQuestionInput = {
  text: Scalars['String']['input'];
};

export type CreateQuestionPayload = {
  __typename?: 'CreateQuestionPayload';
  question: ServerQuestion;
};

export type CreateRuleInput = {
  description: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type CreateRulePayload = {
  __typename?: 'CreateRulePayload';
  rule: Rule;
};

export type CreateServerInviteInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  maxUses?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateServerInvitePayload = {
  __typename?: 'CreateServerInvitePayload';
  serverInvite: ServerInvite;
};

export type CreateServerRoleInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateServerRolePayload = {
  __typename?: 'CreateServerRolePayload';
  serverRole: ServerRole;
};

export type CreateVoteInput = {
  proposalId?: InputMaybe<Scalars['Int']['input']>;
  questionnaireTicketId?: InputMaybe<Scalars['Int']['input']>;
  voteType: Scalars['String']['input'];
};

export type CreateVotePayload = {
  __typename?: 'CreateVotePayload';
  vote: Vote;
};

export const DecisionMakingModel = {
  Consensus: 'Consensus',
  Consent: 'Consent',
  MajorityVote: 'MajorityVote',
} as const;

export type DecisionMakingModel =
  (typeof DecisionMakingModel)[keyof typeof DecisionMakingModel];
export type DeleteGroupRoleMemberInput = {
  groupRoleId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};

export type DeleteGroupRoleMemberPayload = {
  __typename?: 'DeleteGroupRoleMemberPayload';
  groupRole: GroupRole;
};

export type DeleteLikeInput = {
  commentId?: InputMaybe<Scalars['Int']['input']>;
  postId?: InputMaybe<Scalars['Int']['input']>;
  questionId?: InputMaybe<Scalars['Int']['input']>;
};

export type DeleteServerRoleMemberInput = {
  serverRoleId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};

export type DeleteServerRoleMemberPayload = {
  __typename?: 'DeleteServerRoleMemberPayload';
  me: User;
  serverRole: ServerRole;
};

export type Event = {
  __typename?: 'Event';
  attendees: Array<EventAttendee>;
  attendingStatus?: Maybe<Scalars['String']['output']>;
  coverPhoto: Image;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  externalLink?: Maybe<Scalars['String']['output']>;
  goingCount: Scalars['Int']['output'];
  group?: Maybe<Group>;
  host?: Maybe<User>;
  id: Scalars['Int']['output'];
  images: Array<Image>;
  interestedCount: Scalars['Int']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  posts: Array<Post>;
  postsCount: Scalars['Int']['output'];
  startsAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EventPostsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type EventAttendee = {
  __typename?: 'EventAttendee';
  createdAt: Scalars['DateTime']['output'];
  event: Event;
  id: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type EventsInput = {
  online?: InputMaybe<Scalars['Boolean']['input']>;
  timeFrame?: InputMaybe<Scalars['String']['input']>;
};

export type FeedItem = Post | Proposal;

export type FeedItemsConnection = {
  __typename?: 'FeedItemsConnection';
  nodes: Array<FeedItem>;
  totalCount: Scalars['Int']['output'];
};

export type FollowUserPayload = {
  __typename?: 'FollowUserPayload';
  followedUser: User;
  follower: User;
};

export type Group = {
  __typename?: 'Group';
  chat: Conversation;
  coverPhoto?: Maybe<Image>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  feed: Array<FeedItem>;
  feedCount: Scalars['Int']['output'];
  futureEvents: Array<Event>;
  id: Scalars['Int']['output'];
  isDefault: Scalars['Boolean']['output'];
  isJoinedByMe: Scalars['Boolean']['output'];
  memberCount: Scalars['Int']['output'];
  memberRequestCount?: Maybe<Scalars['Int']['output']>;
  memberRequests?: Maybe<Array<GroupMemberRequest>>;
  members: Array<User>;
  myPermissions: GroupPermissions;
  name: Scalars['String']['output'];
  pastEvents: Array<Event>;
  roles: Array<GroupRole>;
  settings: GroupConfig;
  updatedAt: Scalars['DateTime']['output'];
};

export type GroupFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type GroupConfig = {
  __typename?: 'GroupConfig';
  adminModel: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  decisionMakingModel: DecisionMakingModel;
  group: Group;
  id: Scalars['Int']['output'];
  isPublic: Scalars['Boolean']['output'];
  privacy: Scalars['String']['output'];
  ratificationThreshold: Scalars['Int']['output'];
  reservationsLimit: Scalars['Int']['output'];
  standAsidesLimit: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  votingTimeLimit: Scalars['Int']['output'];
};

export type GroupMemberRequest = {
  __typename?: 'GroupMemberRequest';
  createdAt: Scalars['DateTime']['output'];
  group: Group;
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type GroupPermissions = {
  __typename?: 'GroupPermissions';
  approveMemberRequests: Scalars['Boolean']['output'];
  createEvents: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  manageComments: Scalars['Boolean']['output'];
  manageEvents: Scalars['Boolean']['output'];
  managePosts: Scalars['Boolean']['output'];
  manageRoles: Scalars['Boolean']['output'];
  manageSettings: Scalars['Boolean']['output'];
  removeMembers: Scalars['Boolean']['output'];
  updateGroup: Scalars['Boolean']['output'];
};

export type GroupRole = {
  __typename?: 'GroupRole';
  availableUsersToAdd: Array<User>;
  color: Scalars['String']['output'];
  group: Group;
  id: Scalars['Int']['output'];
  memberCount: Scalars['Int']['output'];
  members: Array<User>;
  name: Scalars['String']['output'];
  permissions: GroupRolePermission;
  proposalActionRoles: Array<ProposalActionRole>;
};

export type GroupRolePermission = {
  __typename?: 'GroupRolePermission';
  approveMemberRequests: Scalars['Boolean']['output'];
  createEvents: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  groupRole: GroupRole;
  id: Scalars['Int']['output'];
  manageComments: Scalars['Boolean']['output'];
  manageEvents: Scalars['Boolean']['output'];
  managePosts: Scalars['Boolean']['output'];
  manageRoles: Scalars['Boolean']['output'];
  manageSettings: Scalars['Boolean']['output'];
  removeMembers: Scalars['Boolean']['output'];
  updateGroup: Scalars['Boolean']['output'];
};

export type GroupRolePermissionInput = {
  approveMemberRequests?: InputMaybe<Scalars['Boolean']['input']>;
  createEvents?: InputMaybe<Scalars['Boolean']['input']>;
  deleteGroup?: InputMaybe<Scalars['Boolean']['input']>;
  manageComments?: InputMaybe<Scalars['Boolean']['input']>;
  manageEvents?: InputMaybe<Scalars['Boolean']['input']>;
  managePosts?: InputMaybe<Scalars['Boolean']['input']>;
  manageRoles?: InputMaybe<Scalars['Boolean']['input']>;
  manageSettings?: InputMaybe<Scalars['Boolean']['input']>;
  removeMembers?: InputMaybe<Scalars['Boolean']['input']>;
  updateGroup?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GroupsInput = {
  joinedGroups?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type HomeFeedInput = {
  feedType: HomeFeedType;
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
};

export const HomeFeedType = {
  Following: 'Following',
  Proposals: 'Proposals',
  YourFeed: 'YourFeed',
} as const;

export type HomeFeedType = (typeof HomeFeedType)[keyof typeof HomeFeedType];
export type Image = {
  __typename?: 'Image';
  filename: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  imageType: Scalars['String']['output'];
};

export type Like = {
  __typename?: 'Like';
  comment?: Maybe<Comment>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  post?: Maybe<Post>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type LikesInput = {
  commentId?: InputMaybe<Scalars['Int']['input']>;
  postId?: InputMaybe<Scalars['Int']['input']>;
  questionId?: InputMaybe<Scalars['Int']['input']>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  body?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  images: Array<Image>;
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  answerQuestions: AnswerQuestionsPayload;
  approveGroupMemberRequest: ApproveGroupMemberRequestPayload;
  cancelGroupMemberRequest: Scalars['Boolean']['output'];
  clearNotifications: Scalars['Boolean']['output'];
  createComment: CreateCommentPayload;
  createEvent: CreateEventPayload;
  createEventAttendee: CreateEventAttendeePayload;
  createGroup: CreateGroupPayload;
  createGroupMemberRequest: CreateGroupMemberRequestPayload;
  createGroupRole: CreateGroupRolePayload;
  createLike: CreateLikePayload;
  createPost: CreatePostPayload;
  createProposal: CreateProposalPayload;
  createQuestion: CreateQuestionPayload;
  createRule: CreateRulePayload;
  createServerInvite: CreateServerInvitePayload;
  createServerRole: CreateServerRolePayload;
  createVote: CreateVotePayload;
  deleteComment: Scalars['Boolean']['output'];
  deleteEvent: Scalars['Boolean']['output'];
  deleteEventAttendee: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteGroupRole: Scalars['Boolean']['output'];
  deleteGroupRoleMember: DeleteGroupRoleMemberPayload;
  deleteImage: Scalars['Boolean']['output'];
  deleteLike: Scalars['Boolean']['output'];
  deleteNotification: Scalars['Boolean']['output'];
  deletePost: Scalars['Boolean']['output'];
  deleteProposal: Scalars['Boolean']['output'];
  deleteQuestion: Scalars['Boolean']['output'];
  deleteQuestionnnaireTicket: Scalars['Boolean']['output'];
  deleteRule: Scalars['Boolean']['output'];
  deleteServerInvite: Scalars['Boolean']['output'];
  deleteServerRole: Scalars['Boolean']['output'];
  deleteServerRoleMember: DeleteServerRoleMemberPayload;
  deleteUser: Scalars['Boolean']['output'];
  deleteVote: Scalars['Boolean']['output'];
  denyGroupMemberRequest: Scalars['Boolean']['output'];
  followUser: FollowUserPayload;
  leaveGroup: Scalars['Boolean']['output'];
  logOut: Scalars['Boolean']['output'];
  login: AuthPayload;
  readNotifications: Scalars['Boolean']['output'];
  resetPassword: AuthPayload;
  sendMessage: SendMessagePayload;
  sendPasswordReset: Scalars['Boolean']['output'];
  signUp: AuthPayload;
  synchronizeProposal: SynchronizeProposalPayload;
  unfollowUser: Scalars['Boolean']['output'];
  updateComment: UpdateCommentPayload;
  updateDefaultGroups: UpdateDefaultGroupsPayload;
  updateEvent: UpdateEventPayload;
  updateEventAttendee: UpdateEventAttendeePayload;
  updateGroup: UpdateGroupPayload;
  updateGroupConfig: UpdateGroupPayload;
  updateGroupRole: UpdateGroupRolePayload;
  updateNotification: UpdateNotificationPayload;
  updatePost: UpdatePostPayload;
  updateProposal: UpdateProposalPayload;
  updateQuestion: UpdateQuestionPayload;
  updateQuestionsPriority: Scalars['Boolean']['output'];
  updateRule: UpdateRulePayload;
  updateRulesPriority: Scalars['Boolean']['output'];
  updateServerConfig: UpdateServerConfigPayload;
  updateServerRole: UpdateServerRolePayload;
  updateUser: UpdateUserPayload;
  updateVote: UpdateVotePayload;
};

export type MutationAnswerQuestionsArgs = {
  answersData: AnswerQuestionsInput;
};

export type MutationApproveGroupMemberRequestArgs = {
  id: Scalars['Int']['input'];
};

export type MutationCancelGroupMemberRequestArgs = {
  id: Scalars['Int']['input'];
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
  groupId: Scalars['Int']['input'];
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

export type MutationCreateQuestionArgs = {
  questionData: CreateQuestionInput;
};

export type MutationCreateRuleArgs = {
  ruleData: CreateRuleInput;
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
  id: Scalars['Int']['input'];
};

export type MutationDeleteEventArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteEventAttendeeArgs = {
  eventId: Scalars['Int']['input'];
};

export type MutationDeleteGroupArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteGroupRoleArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteGroupRoleMemberArgs = {
  groupRoleMemberData: DeleteGroupRoleMemberInput;
};

export type MutationDeleteImageArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteLikeArgs = {
  likeData: DeleteLikeInput;
};

export type MutationDeleteNotificationArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeletePostArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteProposalArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteQuestionArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteQuestionnnaireTicketArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteRuleArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteServerInviteArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteServerRoleArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteServerRoleMemberArgs = {
  serverRoleMemberData: DeleteServerRoleMemberInput;
};

export type MutationDeleteUserArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteVoteArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDenyGroupMemberRequestArgs = {
  id: Scalars['Int']['input'];
};

export type MutationFollowUserArgs = {
  id: Scalars['Int']['input'];
};

export type MutationLeaveGroupArgs = {
  id: Scalars['Int']['input'];
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationSendMessageArgs = {
  messageData: SendMessageInput;
};

export type MutationSendPasswordResetArgs = {
  email: Scalars['String']['input'];
};

export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type MutationSynchronizeProposalArgs = {
  id: Scalars['Int']['input'];
};

export type MutationUnfollowUserArgs = {
  id: Scalars['Int']['input'];
};

export type MutationUpdateCommentArgs = {
  commentData: UpdateCommentInput;
};

export type MutationUpdateDefaultGroupsArgs = {
  defaultGroupsData: UpdateDefaultGroupsInput;
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

export type MutationUpdateNotificationArgs = {
  notificationData: UpdateNotificationInput;
};

export type MutationUpdatePostArgs = {
  postData: UpdatePostInput;
};

export type MutationUpdateProposalArgs = {
  proposalData: UpdateProposalInput;
};

export type MutationUpdateQuestionArgs = {
  questionData: UpdateQuestionInput;
};

export type MutationUpdateQuestionsPriorityArgs = {
  questionsData: UpdateQuestionsPriorityInput;
};

export type MutationUpdateRuleArgs = {
  ruleData: UpdateRuleInput;
};

export type MutationUpdateRulesPriorityArgs = {
  rulesData: UpdateRulesPriorityInput;
};

export type MutationUpdateServerConfigArgs = {
  serverConfigData: UpdateServerConfigInput;
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

export type Notification = {
  __typename?: 'Notification';
  comment?: Maybe<Comment>;
  conversation?: Maybe<Conversation>;
  createdAt: Scalars['DateTime']['output'];
  group?: Maybe<Group>;
  id: Scalars['Int']['output'];
  notificationType: Scalars['String']['output'];
  otherUser?: Maybe<User>;
  post?: Maybe<Post>;
  proposal?: Maybe<Proposal>;
  question?: Maybe<Question>;
  questionnaireTicket?: Maybe<QuestionnaireTicket>;
  status: Scalars['String']['output'];
  unreadMessageCount?: Maybe<Scalars['Int']['output']>;
};

export type Post = {
  __typename?: 'Post';
  body?: Maybe<Scalars['String']['output']>;
  commentCount: Scalars['Int']['output'];
  comments: Array<Comment>;
  createdAt: Scalars['DateTime']['output'];
  event?: Maybe<Event>;
  group?: Maybe<Group>;
  hasMissingSharedPost: Scalars['Boolean']['output'];
  hasMissingSharedProposal: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  images: Array<Image>;
  isLikedByMe: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  likes: Array<Like>;
  shareCount: Scalars['Int']['output'];
  sharedPost?: Maybe<Post>;
  sharedProposal?: Maybe<Proposal>;
  shares: Array<Post>;
  user: User;
};

export type Proposal = {
  __typename?: 'Proposal';
  action: ProposalAction;
  body?: Maybe<Scalars['String']['output']>;
  commentCount: Scalars['Int']['output'];
  comments: Array<Comment>;
  createdAt: Scalars['DateTime']['output'];
  group?: Maybe<Group>;
  id: Scalars['Int']['output'];
  images: Array<Image>;
  myVote?: Maybe<Vote>;
  settings: ProposalConfig;
  shareCount: Scalars['Int']['output'];
  shares: Array<Post>;
  stage: ProposalStage;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  voteCount: Scalars['Int']['output'];
  votes: Array<Vote>;
};

export type ProposalAction = {
  __typename?: 'ProposalAction';
  actionType: ProposalActionType;
  createdAt: Scalars['DateTime']['output'];
  event?: Maybe<ProposalActionEvent>;
  groupCoverPhoto?: Maybe<Image>;
  groupDescription?: Maybe<Scalars['String']['output']>;
  groupName?: Maybe<Scalars['String']['output']>;
  groupSettings?: Maybe<ProposalActionGroupConfig>;
  id: Scalars['Int']['output'];
  proposal: Proposal;
  role?: Maybe<ProposalActionRole>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProposalActionEvent = {
  __typename?: 'ProposalActionEvent';
  coverPhoto?: Maybe<Image>;
  description: Scalars['String']['output'];
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  externalLink?: Maybe<Scalars['String']['output']>;
  host: User;
  hosts: Array<ProposalActionEventHost>;
  id: Scalars['Int']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  proposalAction: ProposalAction;
  startsAt: Scalars['DateTime']['output'];
};

export type ProposalActionEventHost = {
  __typename?: 'ProposalActionEventHost';
  createdAt: Scalars['DateTime']['output'];
  event: ProposalActionEvent;
  id: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type ProposalActionEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  description: Scalars['String']['input'];
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  externalLink?: InputMaybe<Scalars['String']['input']>;
  hostId: Scalars['Int']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  online?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt: Scalars['DateTime']['input'];
};

export type ProposalActionGroupConfig = {
  __typename?: 'ProposalActionGroupConfig';
  adminModel?: Maybe<Scalars['String']['output']>;
  decisionMakingModel?: Maybe<DecisionMakingModel>;
  id: Scalars['Int']['output'];
  oldAdminModel?: Maybe<Scalars['String']['output']>;
  oldDecisionMakingModel?: Maybe<DecisionMakingModel>;
  oldPrivacy?: Maybe<Scalars['String']['output']>;
  oldRatificationThreshold?: Maybe<Scalars['Int']['output']>;
  oldReservationsLimit?: Maybe<Scalars['Int']['output']>;
  oldStandAsidesLimit?: Maybe<Scalars['Int']['output']>;
  oldVotingTimeLimit?: Maybe<Scalars['Int']['output']>;
  privacy?: Maybe<Scalars['String']['output']>;
  proposalAction: ProposalAction;
  ratificationThreshold?: Maybe<Scalars['Int']['output']>;
  reservationsLimit?: Maybe<Scalars['Int']['output']>;
  standAsidesLimit?: Maybe<Scalars['Int']['output']>;
  votingTimeLimit?: Maybe<Scalars['Int']['output']>;
};

export type ProposalActionGroupConfigInput = {
  adminModel?: InputMaybe<Scalars['String']['input']>;
  decisionMakingModel?: InputMaybe<DecisionMakingModel>;
  privacy?: InputMaybe<Scalars['String']['input']>;
  ratificationThreshold?: InputMaybe<Scalars['Int']['input']>;
  reservationsLimit?: InputMaybe<Scalars['Int']['input']>;
  standAsidesLimit?: InputMaybe<Scalars['Int']['input']>;
  votingTimeLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type ProposalActionInput = {
  actionType: ProposalActionType;
  event?: InputMaybe<ProposalActionEventInput>;
  groupCoverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  groupDescription?: InputMaybe<Scalars['String']['input']>;
  groupName?: InputMaybe<Scalars['String']['input']>;
  groupSettings?: InputMaybe<ProposalActionGroupConfigInput>;
  role?: InputMaybe<ProposalActionRoleInput>;
};

export type ProposalActionPermission = {
  __typename?: 'ProposalActionPermission';
  approveMemberRequests?: Maybe<Scalars['Boolean']['output']>;
  createEvents?: Maybe<Scalars['Boolean']['output']>;
  createInvites?: Maybe<Scalars['Boolean']['output']>;
  deleteGroup?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['Int']['output'];
  manageComments?: Maybe<Scalars['Boolean']['output']>;
  manageEvents?: Maybe<Scalars['Boolean']['output']>;
  manageInvites?: Maybe<Scalars['Boolean']['output']>;
  managePosts?: Maybe<Scalars['Boolean']['output']>;
  manageQuestionnaireTickets?: Maybe<Scalars['Boolean']['output']>;
  manageQuestions?: Maybe<Scalars['Boolean']['output']>;
  manageRoles?: Maybe<Scalars['Boolean']['output']>;
  manageRules?: Maybe<Scalars['Boolean']['output']>;
  manageSettings?: Maybe<Scalars['Boolean']['output']>;
  removeGroups?: Maybe<Scalars['Boolean']['output']>;
  removeMembers?: Maybe<Scalars['Boolean']['output']>;
  removeProposals?: Maybe<Scalars['Boolean']['output']>;
  role: ProposalActionRole;
  updateGroup?: Maybe<Scalars['Boolean']['output']>;
};

export type ProposalActionPermissionInput = {
  approveMemberRequests?: InputMaybe<Scalars['Boolean']['input']>;
  createEvents?: InputMaybe<Scalars['Boolean']['input']>;
  createInvites?: InputMaybe<Scalars['Boolean']['input']>;
  deleteGroup?: InputMaybe<Scalars['Boolean']['input']>;
  manageComments?: InputMaybe<Scalars['Boolean']['input']>;
  manageEvents?: InputMaybe<Scalars['Boolean']['input']>;
  manageInvites?: InputMaybe<Scalars['Boolean']['input']>;
  managePosts?: InputMaybe<Scalars['Boolean']['input']>;
  manageQuestionnaireTickets?: InputMaybe<Scalars['Boolean']['input']>;
  manageQuestions?: InputMaybe<Scalars['Boolean']['input']>;
  manageRoles?: InputMaybe<Scalars['Boolean']['input']>;
  manageRules?: InputMaybe<Scalars['Boolean']['input']>;
  manageSettings?: InputMaybe<Scalars['Boolean']['input']>;
  removeGroups?: InputMaybe<Scalars['Boolean']['input']>;
  removeMembers?: InputMaybe<Scalars['Boolean']['input']>;
  removeProposals?: InputMaybe<Scalars['Boolean']['input']>;
  updateGroup?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProposalActionRole = {
  __typename?: 'ProposalActionRole';
  color?: Maybe<Scalars['String']['output']>;
  groupRole?: Maybe<GroupRole>;
  id: Scalars['Int']['output'];
  members?: Maybe<Array<ProposalActionRoleMember>>;
  name?: Maybe<Scalars['String']['output']>;
  oldColor?: Maybe<Scalars['String']['output']>;
  oldName?: Maybe<Scalars['String']['output']>;
  permissions: ProposalActionPermission;
  proposalAction: ProposalAction;
  serverRole?: Maybe<ServerRole>;
};

export type ProposalActionRoleInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  members?: InputMaybe<Array<ProposalActionRoleMemberInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<ProposalActionPermissionInput>;
  roleToUpdateId?: InputMaybe<Scalars['Int']['input']>;
};

export type ProposalActionRoleMember = {
  __typename?: 'ProposalActionRoleMember';
  changeType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  role: ProposalActionRole;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type ProposalActionRoleMemberInput = {
  changeType: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export const ProposalActionType = {
  ChangeCoverPhoto: 'ChangeCoverPhoto',
  ChangeDescription: 'ChangeDescription',
  ChangeName: 'ChangeName',
  ChangeRole: 'ChangeRole',
  ChangeSettings: 'ChangeSettings',
  CreateRole: 'CreateRole',
  PlanEvent: 'PlanEvent',
  Test: 'Test',
} as const;

export type ProposalActionType =
  (typeof ProposalActionType)[keyof typeof ProposalActionType];
export type ProposalConfig = {
  __typename?: 'ProposalConfig';
  closingAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  decisionMakingModel: DecisionMakingModel;
  id: Scalars['Int']['output'];
  proposal: Proposal;
  ratificationThreshold: Scalars['Int']['output'];
  reservationsLimit: Scalars['Int']['output'];
  standAsidesLimit: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export const ProposalStage = {
  Closed: 'Closed',
  Ratified: 'Ratified',
  Revision: 'Revision',
  Voting: 'Voting',
} as const;

export type ProposalStage = (typeof ProposalStage)[keyof typeof ProposalStage];
export type PublicFeedItemsConnection = {
  __typename?: 'PublicFeedItemsConnection';
  nodes: Array<FeedItem>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  authCheck: Scalars['Boolean']['output'];
  canary: Canary;
  conversation: Conversation;
  event: Event;
  events: Array<Event>;
  group: Group;
  groupMemberRequest?: Maybe<GroupMemberRequest>;
  groupRole: GroupRole;
  groupRoles: Array<GroupRole>;
  groups: Array<Group>;
  groupsCount: Scalars['Int']['output'];
  isFirstUser: Scalars['Boolean']['output'];
  isValidResetPasswordToken: Scalars['Boolean']['output'];
  joinedGroupsCount: Scalars['Int']['output'];
  joinedGroupsFeed: Array<FeedItem>;
  joinedGroupsFeedCount: Scalars['Int']['output'];
  likes: Array<Like>;
  me: User;
  membersWithPermission: Array<User>;
  notifications: Array<Notification>;
  notificationsCount: Scalars['Int']['output'];
  post: Post;
  proposal: Proposal;
  publicCanary?: Maybe<Canary>;
  publicGroups: Array<Group>;
  publicGroupsCount: Scalars['Int']['output'];
  publicGroupsFeed: PublicFeedItemsConnection;
  question: Question;
  questionnaireTicket: QuestionnaireTicket;
  questionnaireTicketCount: Scalars['Int']['output'];
  questionnaireTickets: Array<QuestionnaireTicket>;
  ratifiedProposalCount: Scalars['Int']['output'];
  serverConfig: ServerConfig;
  serverInvite: ServerInvite;
  serverInvites: Array<ServerInvite>;
  serverQuestions: Array<ServerQuestion>;
  serverRole: ServerRole;
  serverRoles: Array<ServerRole>;
  serverRules: Array<Rule>;
  unreadNotificationsCount: Scalars['Int']['output'];
  user: User;
  users: Array<User>;
  usersByIds: Array<User>;
  usersCount: Scalars['Int']['output'];
  verifiedUsers: Array<User>;
  vibeChat: Conversation;
  voteCount: Scalars['Int']['output'];
};

export type QueryConversationArgs = {
  id: Scalars['Int']['input'];
};

export type QueryEventArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryEventsArgs = {
  input: EventsInput;
};

export type QueryGroupArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type QueryGroupMemberRequestArgs = {
  groupId: Scalars['Int']['input'];
};

export type QueryGroupRoleArgs = {
  id: Scalars['Int']['input'];
};

export type QueryGroupsArgs = {
  input: GroupsInput;
};

export type QueryIsValidResetPasswordTokenArgs = {
  token: Scalars['String']['input'];
};

export type QueryJoinedGroupsFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryLikesArgs = {
  likesData: LikesInput;
};

export type QueryMembersWithPermissionArgs = {
  permissionName: Scalars['String']['input'];
};

export type QueryNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPostArgs = {
  id: Scalars['Int']['input'];
};

export type QueryProposalArgs = {
  id: Scalars['Int']['input'];
};

export type QueryPublicGroupsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPublicGroupsFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryQuestionArgs = {
  id: Scalars['Int']['input'];
};

export type QueryQuestionnaireTicketArgs = {
  id: Scalars['Int']['input'];
};

export type QueryQuestionnaireTicketCountArgs = {
  status: Scalars['String']['input'];
};

export type QueryQuestionnaireTicketsArgs = {
  input: QuestionnaireTicketsInput;
};

export type QueryServerInviteArgs = {
  token: Scalars['String']['input'];
};

export type QueryServerRoleArgs = {
  id: Scalars['Int']['input'];
};

export type QueryServerRolesArgs = {
  permissionName?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUsersByIdsArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type QueryVerifiedUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Question = {
  __typename?: 'Question';
  answer?: Maybe<Answer>;
  commentCount: Scalars['Int']['output'];
  comments: Array<Comment>;
  id: Scalars['Int']['output'];
  isLikedByMe: Scalars['Boolean']['output'];
  likeCount: Scalars['Int']['output'];
  likes: Array<Like>;
  priority: Scalars['Int']['output'];
  questionnaireTicket: QuestionnaireTicket;
  text: Scalars['String']['output'];
};

export type QuestionnaireTicket = {
  __typename?: 'QuestionnaireTicket';
  agreementVoteCount: Scalars['Int']['output'];
  answerCount: Scalars['Int']['output'];
  commentCount: Scalars['Int']['output'];
  comments: Array<Comment>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  myVote?: Maybe<Vote>;
  prompt?: Maybe<Scalars['String']['output']>;
  questionCount: Scalars['Int']['output'];
  questions: Array<Question>;
  settings: QuestionnaireTicketConfig;
  status: Scalars['String']['output'];
  user: User;
  voteCount: Scalars['Int']['output'];
  votes: Array<Vote>;
  votesNeededToVerify: Scalars['Int']['output'];
};

export type QuestionnaireTicketConfig = {
  __typename?: 'QuestionnaireTicketConfig';
  closingAt?: Maybe<Scalars['DateTime']['output']>;
  decisionMakingModel: DecisionMakingModel;
  id: Scalars['Int']['output'];
  reservationsLimit: Scalars['Int']['output'];
  standAsidesLimit: Scalars['Int']['output'];
  verificationThreshold: Scalars['Int']['output'];
};

export type QuestionnaireTicketsInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  confirmPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  resetPasswordToken?: InputMaybe<Scalars['String']['input']>;
};

export type Rule = {
  __typename?: 'Rule';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  priority: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SendMessageInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  conversationId: Scalars['Int']['input'];
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
};

export type SendMessagePayload = {
  __typename?: 'SendMessagePayload';
  message: Message;
};

export type ServerConfig = {
  __typename?: 'ServerConfig';
  about?: Maybe<Scalars['String']['output']>;
  contactEmail: Scalars['String']['output'];
  decisionMakingModel: DecisionMakingModel;
  id: Scalars['Int']['output'];
  ratificationThreshold: Scalars['Int']['output'];
  reservationsLimit: Scalars['Int']['output'];
  securityTxt?: Maybe<Scalars['String']['output']>;
  serverQuestionsPrompt?: Maybe<Scalars['String']['output']>;
  showCanaryStatement: Scalars['Boolean']['output'];
  standAsidesLimit: Scalars['Int']['output'];
  verificationThreshold: Scalars['Int']['output'];
  votingTimeLimit: Scalars['Int']['output'];
  websiteURL: Scalars['String']['output'];
};

export type ServerInvite = {
  __typename?: 'ServerInvite';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  maxUses?: Maybe<Scalars['Int']['output']>;
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  uses: Scalars['Int']['output'];
};

export type ServerPermissions = {
  __typename?: 'ServerPermissions';
  createInvites: Scalars['Boolean']['output'];
  manageComments: Scalars['Boolean']['output'];
  manageEvents: Scalars['Boolean']['output'];
  manageInvites: Scalars['Boolean']['output'];
  managePosts: Scalars['Boolean']['output'];
  manageQuestionnaireTickets: Scalars['Boolean']['output'];
  manageQuestions: Scalars['Boolean']['output'];
  manageRoles: Scalars['Boolean']['output'];
  manageRules: Scalars['Boolean']['output'];
  manageSettings: Scalars['Boolean']['output'];
  removeGroups: Scalars['Boolean']['output'];
  removeMembers: Scalars['Boolean']['output'];
  removeProposals: Scalars['Boolean']['output'];
};

export type ServerQuestion = {
  __typename?: 'ServerQuestion';
  id: Scalars['Int']['output'];
  priority: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type ServerRole = {
  __typename?: 'ServerRole';
  availableUsersToAdd: Array<User>;
  color: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  memberCount: Scalars['Int']['output'];
  members: Array<User>;
  name: Scalars['String']['output'];
  permissions: ServerRolePermission;
  proposalActionRoles: Array<ProposalActionRole>;
};

export type ServerRolePermission = {
  __typename?: 'ServerRolePermission';
  createInvites: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  manageComments: Scalars['Boolean']['output'];
  manageEvents: Scalars['Boolean']['output'];
  manageInvites: Scalars['Boolean']['output'];
  managePosts: Scalars['Boolean']['output'];
  manageQuestionnaireTickets: Scalars['Boolean']['output'];
  manageQuestions: Scalars['Boolean']['output'];
  manageRoles: Scalars['Boolean']['output'];
  manageRules: Scalars['Boolean']['output'];
  manageSettings: Scalars['Boolean']['output'];
  removeGroups: Scalars['Boolean']['output'];
  removeMembers: Scalars['Boolean']['output'];
  removeProposals: Scalars['Boolean']['output'];
  serverRole: ServerRole;
};

export type ServerRolePermissionInput = {
  createInvites?: InputMaybe<Scalars['Boolean']['input']>;
  manageComments?: InputMaybe<Scalars['Boolean']['input']>;
  manageEvents?: InputMaybe<Scalars['Boolean']['input']>;
  manageInvites?: InputMaybe<Scalars['Boolean']['input']>;
  managePosts?: InputMaybe<Scalars['Boolean']['input']>;
  manageQuestionnaireTickets?: InputMaybe<Scalars['Boolean']['input']>;
  manageQuestions?: InputMaybe<Scalars['Boolean']['input']>;
  manageRoles?: InputMaybe<Scalars['Boolean']['input']>;
  manageRules?: InputMaybe<Scalars['Boolean']['input']>;
  manageSettings?: InputMaybe<Scalars['Boolean']['input']>;
  removeGroups?: InputMaybe<Scalars['Boolean']['input']>;
  removeMembers?: InputMaybe<Scalars['Boolean']['input']>;
  removeProposals?: InputMaybe<Scalars['Boolean']['input']>;
};

export type SignUpInput = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  inviteToken?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  isProposalRatified: Scalars['Boolean']['output'];
  newMessage: Message;
  notification: Notification;
};

export type SubscriptionIsProposalRatifiedArgs = {
  id: Scalars['Int']['input'];
};

export type SubscriptionNewMessageArgs = {
  conversationId: Scalars['Int']['input'];
};

export type SynchronizeProposalPayload = {
  __typename?: 'SynchronizeProposalPayload';
  proposal: Proposal;
};

export type UpdateCommentInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
};

export type UpdateCommentPayload = {
  __typename?: 'UpdateCommentPayload';
  comment: Comment;
};

export type UpdateDefaultGroupInput = {
  groupId: Scalars['Int']['input'];
  isDefault: Scalars['Boolean']['input'];
};

export type UpdateDefaultGroupsInput = {
  groups: Array<UpdateDefaultGroupInput>;
};

export type UpdateDefaultGroupsPayload = {
  __typename?: 'UpdateDefaultGroupsPayload';
  groups: Array<Group>;
};

export type UpdateEventAttendeeInput = {
  eventId: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};

export type UpdateEventAttendeePayload = {
  __typename?: 'UpdateEventAttendeePayload';
  event: Event;
};

export type UpdateEventInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  externalLink?: InputMaybe<Scalars['String']['input']>;
  hostId?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  online?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt: Scalars['DateTime']['input'];
};

export type UpdateEventPayload = {
  __typename?: 'UpdateEventPayload';
  event: Event;
};

export type UpdateGroupConfigInput = {
  adminModel?: InputMaybe<Scalars['String']['input']>;
  decisionMakingModel?: InputMaybe<DecisionMakingModel>;
  groupId: Scalars['Int']['input'];
  privacy?: InputMaybe<Scalars['String']['input']>;
  ratificationThreshold?: InputMaybe<Scalars['Int']['input']>;
  reservationsLimit?: InputMaybe<Scalars['Int']['input']>;
  standAsidesLimit?: InputMaybe<Scalars['Int']['input']>;
  votingTimeLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateGroupInput = {
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGroupPayload = {
  __typename?: 'UpdateGroupPayload';
  group: Group;
};

export type UpdateGroupRoleInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<GroupRolePermissionInput>;
  selectedUserIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateGroupRolePayload = {
  __typename?: 'UpdateGroupRolePayload';
  groupRole: GroupRole;
};

export type UpdateNotificationInput = {
  id: Scalars['Int']['input'];
  status: Scalars['String']['input'];
};

export type UpdateNotificationPayload = {
  __typename?: 'UpdateNotificationPayload';
  notification: Notification;
};

export type UpdatePostInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
};

export type UpdatePostPayload = {
  __typename?: 'UpdatePostPayload';
  post: Post;
};

export type UpdateProposalInput = {
  action: ProposalActionInput;
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  images?: InputMaybe<Array<Scalars['Upload']['input']>>;
};

export type UpdateProposalPayload = {
  __typename?: 'UpdateProposalPayload';
  proposal: Proposal;
};

export type UpdateQuestionInput = {
  id: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type UpdateQuestionPayload = {
  __typename?: 'UpdateQuestionPayload';
  question: ServerQuestion;
};

export type UpdateQuestionPriorityInput = {
  id: Scalars['Int']['input'];
  priority: Scalars['Int']['input'];
};

export type UpdateQuestionsPriorityInput = {
  questions: Array<UpdateQuestionPriorityInput>;
};

export type UpdateRuleInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRulePayload = {
  __typename?: 'UpdateRulePayload';
  rule: Rule;
};

export type UpdateRulePriorityInput = {
  id: Scalars['Int']['input'];
  priority: Scalars['Int']['input'];
};

export type UpdateRulesPriorityInput = {
  rules: Array<UpdateRulePriorityInput>;
};

export type UpdateServerConfigInput = {
  about?: InputMaybe<Scalars['String']['input']>;
  canaryStatement?: InputMaybe<Scalars['String']['input']>;
  decisionMakingModel?: InputMaybe<DecisionMakingModel>;
  ratificationThreshold?: InputMaybe<Scalars['Int']['input']>;
  reservationsLimit?: InputMaybe<Scalars['Int']['input']>;
  securityTxt?: InputMaybe<Scalars['String']['input']>;
  serverQuestionsPrompt?: InputMaybe<Scalars['String']['input']>;
  showCanaryStatement?: InputMaybe<Scalars['Boolean']['input']>;
  standAsidesLimit?: InputMaybe<Scalars['Int']['input']>;
  verificationThreshold?: InputMaybe<Scalars['Int']['input']>;
  votingTimeLimit?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateServerConfigPayload = {
  __typename?: 'UpdateServerConfigPayload';
  canary: Canary;
  serverConfig: ServerConfig;
};

export type UpdateServerRoleInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<ServerRolePermissionInput>;
  selectedUserIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateServerRolePayload = {
  __typename?: 'UpdateServerRolePayload';
  me: User;
  serverRole: ServerRole;
};

export type UpdateUserInput = {
  bio: Scalars['String']['input'];
  coverPhoto?: InputMaybe<Scalars['Upload']['input']>;
  displayName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  profilePicture?: InputMaybe<Scalars['Upload']['input']>;
};

export type UpdateUserPayload = {
  __typename?: 'UpdateUserPayload';
  user: User;
};

export type UpdateVoteInput = {
  id: Scalars['Int']['input'];
  voteType: Scalars['String']['input'];
};

export type UpdateVotePayload = {
  __typename?: 'UpdateVotePayload';
  vote: Vote;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  chatCount: Scalars['Int']['output'];
  chats: Array<Conversation>;
  comments: Array<Comment>;
  coverPhoto?: Maybe<Image>;
  createdAt: Scalars['DateTime']['output'];
  displayName?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  followerCount: Scalars['Int']['output'];
  followers: Array<User>;
  following: Array<User>;
  followingCount: Scalars['Int']['output'];
  homeFeed: FeedItemsConnection;
  id: Scalars['Int']['output'];
  isFollowedByMe: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  joinedGroups: Array<Group>;
  likes: Array<Like>;
  name: Scalars['String']['output'];
  posts: Array<Post>;
  profileFeed: Array<FeedItem>;
  profileFeedCount: Scalars['Int']['output'];
  profilePicture: Image;
  proposals: Array<Proposal>;
  questionnaireTicket?: Maybe<QuestionnaireTicket>;
  serverPermissions: ServerPermissions;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserChatsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type UserFollowersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type UserFollowingArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type UserHomeFeedArgs = {
  input: HomeFeedInput;
};

export type UserProfileFeedArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type Vote = {
  __typename?: 'Vote';
  id: Scalars['Int']['output'];
  proposal?: Maybe<Proposal>;
  questionnaireTicket?: Maybe<QuestionnaireTicket>;
  user: User;
  voteType: Scalars['String']['output'];
};
