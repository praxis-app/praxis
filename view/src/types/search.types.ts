export type SearchKind =
  | 'message'
  | 'threadReply'
  | 'callMessage'
  | 'poll'
  | 'proposal'
  | 'forumPost'
  | 'forumReply';

export type SearchThreadRootKind = 'message' | 'poll';

export interface SearchAuthorRes {
  id: string;
  name: string;
  displayName: string | null;
}

export interface SearchResultRes {
  kind: SearchKind;
  id: string;
  serverId: string;
  serverSlug: string;
  channelId: string;
  channelName: string;
  author: SearchAuthorRes;
  createdAt: string;
  excerpt: string;
  callId: string | null;
  threadRootId: string | null;
  threadRootKind: SearchThreadRootKind | null;
  forumPostId: string | null;
  pollId: string | null;
}

export interface SearchCoverageSourceRes {
  source: string;
  cap: number;
  scanned: number;
  truncated: boolean;
}

export interface SearchCoverageRes {
  mode: string;
  windowStart: string;
  windowEnd: string;
  sources: SearchCoverageSourceRes[];
}

export interface SearchPageRes {
  results: SearchResultRes[];
  nextCursor: string | null;
  hasMore: boolean;
  searchCoverage: SearchCoverageRes;
}

export interface SearchFilters {
  channelId?: string;
  kind?: SearchKind;
}

export interface SearchQueryParams extends SearchFilters {
  q: string;
  before?: string;
  limit?: number;
}
