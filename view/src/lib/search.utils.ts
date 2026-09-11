import {
  SEARCH_CHANNEL_PARAM,
  SEARCH_KIND_PARAM,
  SEARCH_MAX_QUERY_LENGTH,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_PANEL_PARAM,
  SEARCH_PANEL_RIGHT,
  SEARCH_QUERY_PARAM,
} from '@/constants/search.constants';
import { type SearchKind, type SearchResultRes } from '@/types/search.types';

const SEARCH_PANEL_PARAMS = [
  SEARCH_PANEL_PARAM,
  SEARCH_CHANNEL_PARAM,
  SEARCH_QUERY_PARAM,
  SEARCH_KIND_PARAM,
];

export const withoutSearchPanel = (params: URLSearchParams) => {
  const nextParams = new URLSearchParams(params);
  for (const key of SEARCH_PANEL_PARAMS) {
    nextParams.delete(key);
  }
  return nextParams;
};

export const withSearchPanel = (
  target: URLSearchParams,
  current: URLSearchParams,
) => {
  const nextParams = new URLSearchParams(target);
  if (current.get(SEARCH_PANEL_PARAM) !== SEARCH_PANEL_RIGHT) {
    return nextParams;
  }
  for (const key of SEARCH_PANEL_PARAMS) {
    const value = current.get(key);
    if (value) nextParams.set(key, value);
  }
  return nextParams;
};

const RIGHT_PANEL_KINDS: SearchKind[] = [
  'threadReply',
  'forumPost',
  'forumReply',
];

export const opensInRightPanel = (kind: SearchKind) =>
  RIGHT_PANEL_KINDS.includes(kind);

export const normalizeSearchQuery = (query: string) =>
  query.replace(/\s+/gu, ' ').trim().toLowerCase();

export const isSearchQueryValid = (query: string) => {
  const length = [...normalizeSearchQuery(query)].length;
  return length >= SEARCH_MIN_QUERY_LENGTH && length <= SEARCH_MAX_QUERY_LENGTH;
};

export interface SearchResultTarget {
  pathname: string;
  search: string;
}

export const getSearchResultTarget = (
  result: SearchResultRes,
): SearchResultTarget => {
  const channelPath = `/s/${result.serverSlug}/c/${result.channelId}`;
  const params = new URLSearchParams();

  if (result.kind === 'forumPost') {
    return {
      pathname: `${channelPath}/posts/${result.forumPostId ?? result.id}`,
      search: '',
    };
  }

  if (result.kind === 'forumReply') {
    params.set('reply', result.id);
    return {
      pathname: `${channelPath}/posts/${result.forumPostId ?? ''}`,
      search: params.toString(),
    };
  }

  // TODO: this drops the contract's call=<id> focus for decisions made in a
  // call. Their only remaining route to the call is the proposal's own call
  // badge, which resolves against the loaded feed, so a bounded context window
  // that excludes the call artifact leaves no way back to the conversation the
  // decision came from. Fix by resolving poll targets in get_call_feed_around,
  // or amend the contract to keep decisions in the feed
  if (result.kind === 'callMessage' && result.callId) {
    params.set('call', result.callId);
  }

  if (result.kind === 'threadReply' && result.threadRootId) {
    params.set('thread', result.threadRootId);
    if (result.threadRootKind === 'poll') {
      params.set('threadKind', 'poll');
    }
    params.set('reply', result.id);
    return { pathname: channelPath, search: params.toString() };
  }

  if (result.kind === 'poll' || result.kind === 'proposal') {
    params.set('poll', result.pollId ?? result.id);
    return { pathname: channelPath, search: params.toString() };
  }

  params.set('message', result.id);
  return { pathname: channelPath, search: params.toString() };
};

export const getSearchResultHref = (result: SearchResultRes) => {
  const { pathname, search } = getSearchResultTarget(result);
  return search ? `${pathname}?${search}` : pathname;
};

export interface ExcerptSegment {
  text: string;
  isMatch: boolean;
}

export const splitExcerptForHighlight = (
  excerpt: string,
  query: string,
): ExcerptSegment[] => {
  const needle = normalizeSearchQuery(query);
  if (!needle) {
    return [{ text: excerpt, isMatch: false }];
  }

  const haystack = excerpt.toLowerCase();
  const segments: ExcerptSegment[] = [];
  let cursor = 0;

  while (cursor < excerpt.length) {
    const matchIndex = haystack.indexOf(needle, cursor);
    if (matchIndex === -1) {
      break;
    }
    if (matchIndex > cursor) {
      segments.push({
        text: excerpt.slice(cursor, matchIndex),
        isMatch: false,
      });
    }
    segments.push({
      text: excerpt.slice(matchIndex, matchIndex + needle.length),
      isMatch: true,
    });
    cursor = matchIndex + needle.length;
  }

  if (cursor < excerpt.length) {
    segments.push({ text: excerpt.slice(cursor), isMatch: false });
  }

  return segments;
};
