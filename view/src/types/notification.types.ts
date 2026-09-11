import { type ImageRes } from './image.types';

export type NotificationKind =
  | 'new_message'
  | 'new_proposal'
  | 'message_reply'
  | 'forum_reply'
  | 'proposal_vote'
  | 'proposal_ratified'
  | 'proposal_closed'
  | 'server_role_granted'
  | 'event_created';

export type NotificationVoteType = 'agree' | 'disagree' | 'abstain' | 'block';

export interface NotificationActor {
  id: string;
  name: string;
  displayName?: string;
  profilePicture: ImageRes | null;
}

export interface NotificationTarget {
  kind: 'message' | 'poll' | 'serverRole' | 'event' | 'unavailable';
  available: boolean;
  channelId?: string;
  channelName?: string;
  messageId?: string;
  threadRootId?: string;
  threadRootKind?: 'message' | 'poll';

  /** What of the viewer's own the reply landed on, when it was theirs */
  repliedTo?: 'message' | 'poll' | 'proposal';
  forumPostId?: string;
  pollId?: string;
  serverRoleId?: string;
  serverRoleName?: string;
  eventId?: string;
  eventName?: string;
}

export interface NotificationRes {
  id: string;
  kind: NotificationKind;
  serverId: string;
  channelId: string | null;
  actor: NotificationActor | null;
  voteType: NotificationVoteType | null;
  unreadCount: number | null;
  readAt: string | null;
  createdAt: string;
  target: NotificationTarget;
}

export interface NotificationsPageRes {
  notifications: NotificationRes[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface NotificationPayload {
  notification: NotificationRes;

  /** Rows absorbed by the change, which the client drops */
  removedNotificationIds?: string[];
}

export interface UnreadNotificationCountRes {
  unreadCount: number;
}
