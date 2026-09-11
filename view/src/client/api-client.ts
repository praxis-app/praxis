// API client for server endpoints

import { getJsonOrFormData } from '@/client/form-data.utils';
import { LocalStorageKeys } from '@/constants/shared.constants';
import { type UploadProgressHandler } from '@/types/api.types';
import {
  type AuthRes,
  type LoginReq,
  type SignUpReq,
} from '@/types/auth.types';
import { type CallDecisionRes, type JoinCallRes } from '@/types/call.types';
import {
  type ChannelRes,
  type CreateChannelReq,
  type FeedPageRes,
  type UnreadChannelsRes,
  type UpdateChannelOrderReq,
  type UpdateChannelReq,
} from '@/types/channel.types';
import { type ImageRes } from '@/types/image.types';
import {
  type EventDetailRes,
  type EventRes,
  type EventRsvpReq,
  type EventsQuery,
} from '@/types/event.types';
import {
  type CreateForumPostReq,
  type CreateForumReplyReq,
  type ForumPostContextRes,
  type ForumPostRes,
  type ForumPostSort,
  type ForumPostStatus,
  type ForumPostsRes,
  type MoveProposalToForumReq,
  type ProposalForumReferenceRes,
  type UpdateForumPostReq,
} from '@/types/forum.types';
import {
  type InstanceCapabilitiesRes,
  type InstanceConfigReq,
  type InstanceConfigRes,
} from '@/types/instance.types';
import { type CreateInviteReq, type InviteRes } from '@/types/invite.types';
import {
  type CreateReplyReq,
  type MessageRes,
  type ThreadCursor,
  type ThreadPageRes,
} from '@/types/message.types';
import { type CreatePollReq, type PollRes } from '@/types/poll.types';
import { type ActiveDecisionsRes } from '@/types/decision.types';
import {
  type NotificationPayload,
  type NotificationsPageRes,
  type UnreadNotificationCountRes,
} from '@/types/notification.types';
import {
  type CreateRoleReq,
  type InstanceRoleRes,
  type ServerRoleRes,
  type UpdateInstanceRolePermissionsReq,
  type UpdateServerRolePermissionsReq,
} from '@/types/role.types';
import {
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';
import {
  type SearchPageRes,
  type SearchQueryParams,
} from '@/types/search.types';
import { type ServerReq, type ServerRes } from '@/types/server.types';
import {
  type CurrentUserRes,
  type UpdateUserProfileReq,
  type UserProfileRes,
  type UserRes,
} from '@/types/user.types';
import {
  type UserConfigReq,
  type UserConfigRes,
} from '@/types/user-config.types';
import {
  type CreateVoteReq,
  type CreateVoteRes,
  type PollOptionVoterRes,
  type UpdateVoteReq,
  type UpdateVoteRes,
} from '@/types/vote.types';
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type Method,
} from 'axios';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: '/api' });
  }

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------

  login = async (data: LoginReq) => {
    const path = '/auth/login';
    return this.executeRequest<AuthRes>('post', path, {
      data,
    });
  };

  signUp = async (data: SignUpReq) => {
    const path = '/auth/signup';
    return this.executeRequest<AuthRes>('post', path, {
      data,
    });
  };

  createAnonSession = async (inviteToken?: string | null) => {
    const path = '/auth/anon';
    return this.executeRequest<AuthRes>('post', path, {
      data: { inviteToken },
    });
  };

  upgradeAnonSession = async (data: SignUpReq) => {
    const path = '/auth/anon';
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  logOut = async () => {
    const path = '/auth/logout';
    return this.executeRequest<void>('post', path);
  };

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  getCurrentUser = async () => {
    const path = '/users/me';
    return this.executeRequest<{ user: CurrentUserRes }>('get', path);
  };

  getCurrentUserServers = async () => {
    const path = '/users/me/servers';
    return this.executeRequest<{ servers: ServerRes[] }>('get', path);
  };

  getUserConfig = async () => {
    const path = '/users/me/configs';
    return this.executeRequest<{ userConfig: UserConfigRes }>('get', path);
  };

  updateUserConfig = async (data: UserConfigReq) => {
    const path = '/users/me/configs';
    return this.executeRequest<{ userConfig: UserConfigRes }>('put', path, {
      data,
    });
  };

  getUserProfile = async (userId: string) => {
    const path = `/users/${userId}/profile`;
    return this.executeRequest<{ user: UserProfileRes }>('get', path);
  };

  isFirstUser = async () => {
    const path = '/users/is-first';
    return this.executeRequest<{ isFirstUser: boolean }>('get', path);
  };

  getUserImage = (userId: string, imageId: string) => {
    const path = `/users/${userId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  updateUserProfile = async (data: UpdateUserProfileReq) => {
    const path = '/users/profile';
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  uploadUserProfilePicture = async (formData: FormData) => {
    const path = '/users/profile-picture';
    return this.executeRequest<{ image: ImageRes }>('post', path, {
      data: formData,
    });
  };

  uploadUserCoverPhoto = async (formData: FormData) => {
    const path = '/users/cover-photo';
    return this.executeRequest<{ image: ImageRes }>('post', path, {
      data: formData,
    });
  };

  // -------------------------------------------------------------------------
  // Channels & Messages
  // -------------------------------------------------------------------------

  getChannel = async (serverId: string, channelId: string) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<{ channel: ChannelRes }>('get', path);
  };

  getChannels = async (serverId: string) => {
    const path = `/servers/${serverId}/channels`;
    return this.executeRequest<{ channels: ChannelRes[] }>('get', path);
  };

  getJoinedChannels = async (serverId: string) => {
    const path = `/servers/${serverId}/channels/joined`;
    return this.executeRequest<{ channels: ChannelRes[] }>('get', path);
  };

  getUnreadChannels = async (serverId: string) => {
    const path = `/servers/${serverId}/channels/unread`;
    return this.executeRequest<UnreadChannelsRes>('get', path);
  };

  markChannelRead = async (serverId: string, channelId: string) => {
    const path = `/servers/${serverId}/channels/${channelId}/read`;
    return this.executeRequest<void>('put', path);
  };

  getChannelFeed = async (
    serverId: string,
    channelId: string,
    cursor: { before?: string; after?: string; around?: string },
    limit: number,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/feed`;
    return this.executeRequest<FeedPageRes>('get', path, {
      params: { ...cursor, limit },
    });
  };

  getCallFeed = async (
    serverId: string,
    channelId: string,
    callId: string,
    cursor: { before?: string; after?: string; around?: string },
    limit: number,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/feed`;
    return this.executeRequest<FeedPageRes>('get', path, {
      params: { ...cursor, limit },
    });
  };

  getCallDecision = async (
    serverId: string,
    channelId: string,
    callId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/decisions`;
    return this.executeRequest<CallDecisionRes>('get', path);
  };

  createChannel = async (serverId: string, data: CreateChannelReq) => {
    const path = `/servers/${serverId}/channels`;
    return this.executeRequest<{ channel: ChannelRes }>('post', path, {
      data,
    });
  };

  updateChannel = async (
    serverId: string,
    channelId: string,
    data: UpdateChannelReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  updateChannelOrder = async (
    serverId: string,
    data: UpdateChannelOrderReq,
  ) => {
    const path = `/servers/${serverId}/channels/order`;
    return this.executeRequest<void>('put', path, { data });
  };

  deleteChannel = async (serverId: string, channelId: string) => {
    const path = `/servers/${serverId}/channels/${channelId}`;
    return this.executeRequest<void>('delete', path);
  };

  getForumPosts = async (
    serverId: string,
    channelId: string,
    sort: ForumPostSort,
    status?: ForumPostStatus,
    before?: string,
    limit = 20,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts`;
    return this.executeRequest<ForumPostsRes>('get', path, {
      params: { sort, status, before, limit },
    });
  };

  createForumPost = async (
    serverId: string,
    channelId: string,
    data: CreateForumPostReq,
    images: File[] = [],
    eventCoverPhoto?: File,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts`;
    return this.executeRequest<{ post: ForumPostRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images, file: eventCoverPhoto }),
    });
  };

  getForumPostReplies = async (
    serverId: string,
    channelId: string,
    postId: string,
    cursor: ThreadCursor = {},
    limit = 50,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}/replies`;
    return this.executeRequest<ForumPostContextRes>('get', path, {
      params: { ...cursor, limit },
    });
  };

  updateForumPost = async (
    serverId: string,
    channelId: string,
    postId: string,
    data: UpdateForumPostReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}`;
    return this.executeRequest<{ post: ForumPostRes }>('put', path, { data });
  };

  createForumPostProposal = async (
    serverId: string,
    channelId: string,
    postId: string,
    data: CreatePollReq,
    images: File[] = [],
    eventCoverPhoto?: File,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}/proposal`;
    return this.executeRequest<{ post: ForumPostRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images, file: eventCoverPhoto }),
    });
  };

  closeForumPost = async (
    serverId: string,
    channelId: string,
    postId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}/close`;
    return this.executeRequest<{ post: ForumPostRes }>('post', path);
  };

  reopenForumPost = async (
    serverId: string,
    channelId: string,
    postId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}/reopen`;
    return this.executeRequest<{ post: ForumPostRes }>('post', path);
  };

  moveProposalToForum = async (
    serverId: string,
    sourceChannelId: string,
    proposalId: string,
    data: MoveProposalToForumReq,
  ) => {
    const path = `/servers/${serverId}/channels/${sourceChannelId}/polls/${proposalId}/move-to-forum`;
    return this.executeRequest<{
      post: ForumPostRes;
      sourceReference: ProposalForumReferenceRes;
    }>('post', path, { data });
  };

  createForumReply = async (
    serverId: string,
    channelId: string,
    postId: string,
    data: CreateForumReplyReq,
    images: File[] = [],
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/forum/posts/${postId}/replies`;
    return this.executeRequest<{ reply: MessageRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images }),
    });
  };

  joinChannelCall = async (serverId: string, channelId: string) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls`;
    return this.executeRequest<JoinCallRes>('post', path);
  };

  joinChannelCallById = async (
    serverId: string,
    channelId: string,
    callId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/join`;
    return this.executeRequest<JoinCallRes>('post', path);
  };

  leaveChannelCall = async (
    serverId: string,
    channelId: string,
    callId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/leave`;
    return this.executeRequest<void>('post', path);
  };

  sendMessage = async (
    serverId: string,
    channelId: string,
    body: string,
    images: File[] = [],
    onUploadProgress?: UploadProgressHandler,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages`;
    return this.executeRequest<{ message: MessageRes }>('post', path, {
      data: getJsonOrFormData({ body }, { files: images }),
      onUploadProgress,
    });
  };

  getMessageThreadReplies = async (
    serverId: string,
    channelId: string,
    messageId: string,
    cursor: ThreadCursor = {},
    limit = 50,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages/${messageId}/replies`;
    return this.executeRequest<ThreadPageRes>('get', path, {
      params: { ...cursor, limit },
    });
  };

  sendMessageThreadReply = async (
    serverId: string,
    channelId: string,
    messageId: string,
    data: CreateReplyReq,
    images: File[] = [],
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages/${messageId}/replies`;
    return this.executeRequest<{ message: MessageRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images }),
    });
  };

  sendCallMessage = async (
    serverId: string,
    channelId: string,
    callId: string,
    body: string,
    images: File[] = [],
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/messages`;
    return this.executeRequest<{ message: MessageRes }>('post', path, {
      data: getJsonOrFormData({ body }, { files: images }),
    });
  };

  getMessageImage = (
    serverId: string,
    channelId: string,
    messageId: string,
    imageId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/messages/${messageId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, {
      responseType: 'blob',
    });
  };

  // -------------------------------------------------------------------------
  // Polls & Votes
  // -------------------------------------------------------------------------

  getActiveDecisions = async (
    serverId: string,
    before: string | undefined,
    limit: number,
  ) => {
    const path = `/servers/${serverId}/decisions`;
    return this.executeRequest<ActiveDecisionsRes>('get', path, {
      params: { before, limit },
    });
  };

  getPollThreadReplies = async (
    serverId: string,
    channelId: string,
    pollId: string,
    cursor: ThreadCursor = {},
    limit = 50,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/replies`;
    return this.executeRequest<ThreadPageRes>('get', path, {
      params: { ...cursor, limit },
    });
  };

  sendPollThreadReply = async (
    serverId: string,
    channelId: string,
    pollId: string,
    data: CreateReplyReq,
    images: File[] = [],
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/replies`;
    return this.executeRequest<{ message: MessageRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images }),
    });
  };

  getPollActionEventCoverPhoto = (
    serverId: string,
    channelId: string,
    pollId: string,
    imageId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/event-cover-photos/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  getPollImage = (
    serverId: string,
    channelId: string,
    pollId: string,
    imageId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  getVotersByPollOption = async (
    serverId: string,
    channelId: string,
    pollId: string,
    pollOptionId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/options/${pollOptionId}/voters`;
    return this.executeRequest<{ voters: PollOptionVoterRes[] }>('get', path);
  };

  createPoll = async (
    serverId: string,
    channelId: string,
    data: CreatePollReq,
    images: File[] = [],
    eventCoverPhoto?: File,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls`;
    return this.executeRequest<{ poll: PollRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images, file: eventCoverPhoto }),
    });
  };

  createCallPoll = async (
    serverId: string,
    channelId: string,
    callId: string,
    data: CreatePollReq,
    images: File[] = [],
    eventCoverPhoto?: File,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/calls/${callId}/polls`;
    return this.executeRequest<{ poll: PollRes }>('post', path, {
      data: getJsonOrFormData(data, { files: images, file: eventCoverPhoto }),
    });
  };

  createVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    data: CreateVoteReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes`;
    return this.executeRequest<{ vote: CreateVoteRes }>('post', path, {
      data,
    });
  };

  updateVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    voteId: string,
    data: UpdateVoteReq,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes/${voteId}`;
    return this.executeRequest<UpdateVoteRes>('put', path, {
      data,
    });
  };

  deleteVote = async (
    serverId: string,
    channelId: string,
    pollId: string,
    voteId: string,
  ) => {
    const path = `/servers/${serverId}/channels/${channelId}/polls/${pollId}/votes/${voteId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Servers
  // -------------------------------------------------------------------------

  getServers = async () => {
    const path = '/servers';
    return this.executeRequest<{ servers: ServerRes[] }>('get', path);
  };

  getServerById = async (serverId: string) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getServerByInviteToken = async (inviteToken: string) => {
    const path = `/servers/invite/${inviteToken}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getServerMembers = async (serverId: string) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  getUsersEligibleForServer = async (serverId: string) => {
    const path = `/servers/${serverId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  getServerBySlug = async (slug: string) => {
    const path = `/servers/slug/${slug}`;
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  getDefaultServer = async () => {
    const path = '/servers/default';
    return this.executeRequest<{ server: ServerRes }>('get', path);
  };

  setCurrentServer = async (serverId: string) => {
    const path = `/servers/${serverId}/current`;
    return this.executeRequest<void>('post', path);
  };

  createServer = async (data: ServerReq, image?: File) => {
    const path = '/servers';
    return this.executeRequest<{ server: ServerRes }>('post', path, {
      data: getJsonOrFormData(data, { file: image }),
    });
  };

  updateServer = async (serverId: string, data: ServerReq, image?: File) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<{ server: ServerRes }>('put', path, {
      data: getJsonOrFormData(data, { file: image }),
    });
  };

  getServerImage = async (serverId: string, imageId: string) => {
    const path = `/servers/${serverId}/images/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  deleteServer = async (serverId: string) => {
    const path = `/servers/${serverId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  getEvents = async (serverId: string, query: EventsQuery) => {
    const path = `/servers/${serverId}/events`;
    return this.executeRequest<{ events: EventRes[] }>('get', path, {
      params: { ...query },
    });
  };

  getEvent = async (serverId: string, eventId: string) => {
    const path = `/servers/${serverId}/events/${eventId}`;
    return this.executeRequest<{ event: EventDetailRes }>('get', path);
  };

  getEventCoverPhoto = (serverId: string, eventId: string, imageId: string) => {
    const path = `/servers/${serverId}/events/${eventId}/cover-photos/${imageId}`;
    return this.executeRequest<Blob>('get', path, { responseType: 'blob' });
  };

  updateEventRsvp = async (
    serverId: string,
    eventId: string,
    data: EventRsvpReq,
  ) => {
    const path = `/servers/${serverId}/events/${eventId}/rsvp`;
    return this.executeRequest<{ event: EventDetailRes }>('put', path, {
      data,
    });
  };

  clearEventRsvp = async (serverId: string, eventId: string) => {
    const path = `/servers/${serverId}/events/${eventId}/rsvp`;
    return this.executeRequest<{ event: EventDetailRes }>('delete', path);
  };

  addServerMembers = async (serverId: string, userIds: string[]) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeServerMembers = async (serverId: string, userIds: string[]) => {
    const path = `/servers/${serverId}/members`;
    return this.executeRequest<void>('delete', path, {
      data: { userIds },
    });
  };

  joinServer = async (serverId: string, inviteToken: string) => {
    const path = `/servers/${serverId}/join`;
    return this.executeRequest<void>('post', path, {
      data: { inviteToken },
    });
  };

  // -------------------------------------------------------------------------
  // Server Configs
  // -------------------------------------------------------------------------

  getServerConfig = async (serverId: string) => {
    const path = `/servers/${serverId}/configs`;
    return this.executeRequest<{ serverConfig: ServerConfigRes }>('get', path);
  };

  isAnonymousUsersEnabled = async (serverId: string) => {
    const path = `/servers/${serverId}/configs/anon-enabled`;
    return this.executeRequest<{ anonymousUsersEnabled: boolean }>('get', path);
  };

  updateServerConfig = async (serverId: string, data: ServerConfigReq) => {
    const path = `/servers/${serverId}/configs`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  // -------------------------------------------------------------------------
  // Server Roles & Permissions
  // -------------------------------------------------------------------------

  getServerRole = async (serverId: string, serverRoleId: string) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<{ serverRole: ServerRoleRes }>('get', path);
  };

  getServerRoles = async (serverId: string) => {
    const path = `/servers/${serverId}/roles`;
    return this.executeRequest<{ serverRoles: ServerRoleRes[] }>('get', path);
  };

  getUsersEligibleForServerRole = async (
    serverId: string,
    serverRoleId: string,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  createServerRole = async (serverId: string, data: CreateRoleReq) => {
    const path = `/servers/${serverId}/roles`;
    return this.executeRequest<{ serverRole: ServerRoleRes }>('post', path, {
      data,
    });
  };

  updateServerRole = async (
    serverId: string,
    serverRoleId: string,
    data: CreateRoleReq,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  updateServerRolePermissions = async (
    serverId: string,
    serverRoleId: string,
    data: UpdateServerRolePermissionsReq,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/permissions`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  addServerRoleMembers = async (
    serverId: string,
    serverRoleId: string,
    userIds: string[],
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeServerRoleMember = async (
    serverId: string,
    serverRoleId: string,
    userId: string,
  ) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}/members/${userId}`;
    return this.executeRequest<void>('delete', path);
  };

  deleteServerRole = async (serverId: string, serverRoleId: string) => {
    const path = `/servers/${serverId}/roles/${serverRoleId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Instance Config
  // -------------------------------------------------------------------------

  getInstanceCapabilities = async () => {
    const path = '/instance/capabilities';
    return this.executeRequest<InstanceCapabilitiesRes>('get', path);
  };

  updateInstanceConfig = async (data: InstanceConfigReq) => {
    const path = `/instance/config`;
    return this.executeRequest<{ instanceConfig: InstanceConfigRes }>(
      'put',
      path,
      { data },
    );
  };

  // -------------------------------------------------------------------------
  // Instance Roles & Permissions
  // -------------------------------------------------------------------------

  getInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<{ instanceRole: InstanceRoleRes }>('get', path);
  };

  getInstanceRoles = async () => {
    const path = `/instance/roles`;
    return this.executeRequest<{ instanceRoles: InstanceRoleRes[] }>(
      'get',
      path,
    );
  };

  getUsersEligibleForInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}/members/eligible`;
    return this.executeRequest<{ users: UserRes[] }>('get', path);
  };

  createInstanceRole = async (data: CreateRoleReq) => {
    const path = `/instance/roles`;
    return this.executeRequest<{ instanceRole: InstanceRoleRes }>(
      'post',
      path,
      { data },
    );
  };

  updateInstanceRole = async (instanceRoleId: string, data: CreateRoleReq) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  updateInstanceRolePermissions = async (
    instanceRoleId: string,
    data: UpdateInstanceRolePermissionsReq,
  ) => {
    const path = `/instance/roles/${instanceRoleId}/permissions`;
    return this.executeRequest<void>('put', path, {
      data,
    });
  };

  addInstanceRoleMembers = async (
    instanceRoleId: string,
    userIds: string[],
  ) => {
    const path = `/instance/roles/${instanceRoleId}/members`;
    return this.executeRequest<void>('post', path, {
      data: { userIds },
    });
  };

  removeInstanceRoleMember = async (instanceRoleId: string, userId: string) => {
    const path = `/instance/roles/${instanceRoleId}/members/${userId}`;
    return this.executeRequest<void>('delete', path);
  };

  deleteInstanceRole = async (instanceRoleId: string) => {
    const path = `/instance/roles/${instanceRoleId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Invites
  // -------------------------------------------------------------------------

  isValidInvite = async (token: string) => {
    const path = `/invites/validate/${token}`;
    return this.executeRequest<{ isValidInvite: boolean }>('get', path);
  };

  getInvites = async (serverId: string) => {
    const path = `/servers/${serverId}/invites`;
    return this.executeRequest<{ invites: InviteRes[] }>('get', path);
  };

  createInvite = async (serverId: string, data: CreateInviteReq) => {
    const path = `/servers/${serverId}/invites`;
    return this.executeRequest<{ invite: InviteRes }>('post', path, {
      data,
    });
  };

  deleteInvite = async (serverId: string, inviteId: string) => {
    const path = `/servers/${serverId}/invites/${inviteId}`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------------------

  getNotifications = async (
    serverId: string,
    before?: string,
    limit?: number,
  ) => {
    const path = `/servers/${serverId}/notifications`;
    return this.executeRequest<NotificationsPageRes>('get', path, {
      params: { before, limit },
    });
  };

  getUnreadNotificationCount = async (serverId: string) => {
    const path = `/servers/${serverId}/notifications/unread-count`;
    return this.executeRequest<UnreadNotificationCountRes>('get', path);
  };

  markNotificationRead = async (serverId: string, notificationId: string) => {
    const path = `/servers/${serverId}/notifications/${notificationId}/read`;
    return this.executeRequest<NotificationPayload>('put', path);
  };

  markNotificationUnread = async (
    serverId: string,
    notificationId: string,
  ) => {
    const path = `/servers/${serverId}/notifications/${notificationId}/unread`;
    return this.executeRequest<NotificationPayload>('put', path);
  };

  markAllNotificationsRead = async (serverId: string) => {
    const path = `/servers/${serverId}/notifications/read-all`;
    return this.executeRequest<void>('put', path);
  };

  deleteNotification = async (serverId: string, notificationId: string) => {
    const path = `/servers/${serverId}/notifications/${notificationId}`;
    return this.executeRequest<void>('delete', path);
  };

  clearNotifications = async (serverId: string) => {
    const path = `/servers/${serverId}/notifications`;
    return this.executeRequest<void>('delete', path);
  };

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  search = async (
    serverId: string,
    params: SearchQueryParams,
    signal?: AbortSignal,
  ) => {
    const path = `/servers/${serverId}/search`;
    return this.executeRequest<SearchPageRes>('get', path, {
      params: { ...params },
      signal,
    });
  };

  // -------------------------------------------------------------------------
  // Misc.
  // -------------------------------------------------------------------------

  getHealth = async () => {
    return this.executeRequest<{ timestamp: string }>('get', '/health');
  };

  private async executeRequest<T>(
    method: Method,
    path: string,
    options?: {
      data?: unknown;
      params?: Record<string, unknown>;
      responseType?: AxiosResponse['config']['responseType'];
      onUploadProgress?: UploadProgressHandler;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    try {
      const token = localStorage.getItem(LocalStorageKeys.AccessToken);
      const inviteToken = localStorage.getItem(LocalStorageKeys.InviteToken);
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(inviteToken ? { 'X-Invite-Token': inviteToken } : {}),
      };

      const response: AxiosResponse<T> = await this.axiosInstance.request<T>({
        method,
        url: path,
        data: options?.data,
        params: options?.params,
        responseType: options?.responseType,
        signal: options?.signal,
        onUploadProgress: options?.onUploadProgress
          ? ({ loaded, total }) =>
              options.onUploadProgress?.(total ? loaded / total : 0)
          : undefined,
        headers,
      });

      return response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(`API request error: ${error}`);
      }
      throw error;
    }
  }
}

export const api = new ApiClient();
