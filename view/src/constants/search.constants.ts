import { type SearchKind } from '@/types/search.types';

export const SEARCH_MIN_QUERY_LENGTH = 2;
export const SEARCH_MAX_QUERY_LENGTH = 200;

export const SEARCH_PANEL_PARAM = 'searchPanel';
export const SEARCH_CHANNEL_PARAM = 'searchChannel';
export const SEARCH_QUERY_PARAM = 'searchQuery';
export const SEARCH_KIND_PARAM = 'searchKind';
export const SEARCH_PANEL_RIGHT = 'right';

export const SEARCH_KINDS: SearchKind[] = [
  'message',
  'threadReply',
  'callMessage',
  'poll',
  'proposal',
  'forumPost',
  'forumReply',
];
