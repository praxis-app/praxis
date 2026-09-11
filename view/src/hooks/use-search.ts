import { api } from '@/client/api-client';
import { useAuthData } from '@/hooks/use-auth-data';
import {
  isSearchQueryValid,
  normalizeSearchQuery,
} from '@/lib/search.utils';
import {
  type SearchFilters,
  type SearchPageRes,
} from '@/types/search.types';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';

export const SEARCH_DEBOUNCE_MS = 300;
export const SEARCH_PAGE_SIZE = 25;

const SEARCH_QUERY_KEY_PREFIX = 'search';

interface Options {
  serverId?: string;
  query: string;
  filters: SearchFilters;
  enabled?: boolean;
}

const isAccessError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status === 401 || status === 403 || status === 404;
};

export const useSearch = ({
  serverId,
  query,
  filters,
  enabled = true,
}: Options) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const queryClient = useQueryClient();
  const { me } = useAuthData();
  const userId = me?.id;

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQuery(query),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  const forgetCachedSearches = useCallback(
    () => queryClient.removeQueries({ queryKey: [SEARCH_QUERY_KEY_PREFIX] }),
    [queryClient],
  );

  useEffect(() => {
    if (!userId) {
      forgetCachedSearches();
    }
  }, [forgetCachedSearches, userId]);

  const normalizedQuery = normalizeSearchQuery(debouncedQuery);
  const isQueryValid = isSearchQueryValid(debouncedQuery);
  const isEnabled = enabled && !!serverId && !!userId && isQueryValid;

  const searchQuery = useInfiniteQuery({
    queryKey: [
      SEARCH_QUERY_KEY_PREFIX,
      userId,
      serverId,
      normalizedQuery,
      filters.channelId ?? null,
      filters.kind ?? null,
    ],
    queryFn: ({ pageParam, signal }) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.search(
        serverId,
        {
          q: debouncedQuery.trim(),
          channelId: filters.channelId,
          kind: filters.kind,
          before: pageParam ?? undefined,
          limit: SEARCH_PAGE_SIZE,
        },
        signal,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: SearchPageRes) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: isEnabled,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const { error } = searchQuery;

  useEffect(() => {
    if (isAccessError(error)) {
      forgetCachedSearches();
    }
  }, [error, forgetCachedSearches]);

  const pages = searchQuery.data?.pages ?? [];
  const results = pages.flatMap((page) => page.results);
  const searchCoverage = pages[0]?.searchCoverage;
  const isDebouncing = debouncedQuery !== query;

  return {
    ...searchQuery,
    isAccessError: isAccessError(error),
    isDebouncing,
    isQueryValid,
    normalizedQuery,
    results,
    searchCoverage,
  };
};
