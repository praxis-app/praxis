import { subscribeToBrowserResume } from '@/lib/browser.utils';
import { anchoredQueryKey } from '@/lib/query.utils';
import {
  type FeedItemRes,
  type FeedPageRes,
  type FeedQuery,
} from '@/types/channel.types';
import {
  hashKey,
  type QueryKey,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useEffectEvent, useMemo, useRef } from 'react';

interface FeedCursorParams {
  before?: string;
  after?: string;
  around?: string;
}

interface Options {
  enabled: boolean;
  pageSize: number;
  queryKey: QueryKey;
  anchorId?: string;
  fetchPage: (cursor: FeedCursorParams, limit: number) => Promise<FeedPageRes>;
}

const feedItemKey = (item: FeedItemRes) => `${item.type}:${item.id}`;

export const feedQueryKeyFor = anchoredQueryKey;

const sortNewestFirst = (left: FeedItemRes, right: FeedItemRes) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime() ||
  right.id.localeCompare(left.id);

export const useFeedQuery = ({
  enabled,
  pageSize,
  queryKey: baseQueryKey,
  anchorId,
  fetchPage,
}: Options) => {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => feedQueryKeyFor(baseQueryKey, anchorId),
    [baseQueryKey, anchorId],
  );
  const queryHash = hashKey(queryKey);
  const hadCachedData = useMemo(
    () => !!queryClient.getQueryData<FeedQuery>(queryKey),
    [queryClient, queryKey],
  );
  const syncedQueryHashes = useRef(new Set<string>());

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchPage(pageParam ?? (anchorId ? { around: anchorId } : {}), pageSize),
    getNextPageParam: (lastPage): FeedCursorParams | undefined =>
      lastPage.hasMore && lastPage.nextCursor
        ? { before: lastPage.nextCursor }
        : undefined,
    getPreviousPageParam: (firstPage): FeedCursorParams | undefined =>
      firstPage.hasMoreNewer && firstPage.startCursor
        ? { after: firstPage.startCursor }
        : undefined,
    initialPageParam: null as FeedCursorParams | null,
    enabled,
    staleTime: Infinity,
  });

  const syncNewerItems = useEffectEvent(async () => {
    const cachedFeed = queryClient.getQueryData<FeedQuery>(queryKey);
    const newestCursor = cachedFeed?.pages[0]?.startCursor;
    if (!cachedFeed || !newestCursor) {
      await query.refetch();
      return;
    }

    const newItems: FeedItemRes[] = [];
    let after = newestCursor;
    let latestCursor = newestCursor;
    let hasMore = true;

    while (hasMore) {
      const page = await fetchPage({ after }, pageSize);
      newItems.push(...page.feed);
      if (!page.startCursor) break;
      latestCursor = page.startCursor;
      after = page.startCursor;
      hasMore = page.hasMoreNewer;
    }

    if (newItems.length === 0) return;

    queryClient.setQueryData<FeedQuery>(queryKey, (currentFeed) => {
      if (!currentFeed?.pages[0]) return currentFeed;

      const firstPage = currentFeed.pages[0];
      const mergedItems = [...newItems, ...firstPage.feed];
      const uniqueItems = [
        ...new Map(
          mergedItems.map((item) => [feedItemKey(item), item]),
        ).values(),
      ].sort(sortNewestFirst);

      return {
        ...currentFeed,
        pages: [
          { ...firstPage, feed: uniqueItems, startCursor: latestCursor },
          ...currentFeed.pages.slice(1),
        ],
      };
    });
  });

  useEffect(() => {
    if (
      !enabled ||
      anchorId ||
      !hadCachedData ||
      syncedQueryHashes.current.has(queryHash)
    ) {
      return;
    }
    syncedQueryHashes.current.add(queryHash);
    void syncNewerItems();
  }, [enabled, anchorId, hadCachedData, queryHash]);

  const refetchFeed = query.refetch;

  // Replies update existing items, so refresh loaded pages on browser resume
  useEffect(() => {
    if (!enabled) {
      return;
    }
    return subscribeToBrowserResume(() => void refetchFeed());
  }, [enabled, refetchFeed]);

  const feed = useMemo(
    () => query.data?.pages.flatMap((page) => page.feed) || [],
    [query.data?.pages],
  );

  return { ...query, feed, queryKey, isAnchored: !!anchorId };
};
