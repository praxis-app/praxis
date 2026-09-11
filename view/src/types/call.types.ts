import { type PollRes } from './poll.types';

export interface CallRes {
  id: string;
  serverId: string;
  channelId: string;
  roomName: string;
  status: string;
}

export interface JoinCallRes {
  livekitUrl: string;
  roomName: string;
  token: string;
  call: CallRes;
}

export interface CallJoinPreferences {
  audioDeviceId: string;
  audioEnabled: boolean;
  videoDeviceId: string;
  videoEnabled: boolean;
}

export interface CallDecisionRes {
  activeItem?: PollRes | null;
  recentResult?: PollRes | null;
}

export interface CallUserRes {
  id: string;
  name: string;
  displayName?: string | null;
  profilePicture?: {
    id: string;
    createdAt: string;
  } | null;
}

export interface CallSummaryRes {
  messages: number;
  proposals: number;
  polls: number;
}

export interface CallArtifactRes {
  type: 'call';
  id: string;
  serverId: string;
  channelId: string;
  roomName: string;
  status: string;
  startedBy: CallUserRes;
  participants: CallUserRes[];
  participantCount: number;
  durationSeconds: number;
  summary: CallSummaryRes;
  createdAt: string;
  endedAt?: string | null;
}
