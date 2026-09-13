import { feedQueryKeyFor, useFeedQuery } from '@/hooks/use-feed-query';
import { type FeedItemRes, type FeedPageRes } from '@/types/channel.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const message = (id: string, createdAt: string): FeedItemRes => ({
  type: 'message',
  id,
  createdAt,
  body: id,
  user: null,
  userId: null,
  botId: null,
  bot: null,
  replyCount: 0,
  replyUsers: [],
  latestReplyAt: null,
});

describe('useFeedQuery cached feed sync', () => {
  it.each([
    ['keeps reporting newer pages', (call: number) => `newer-${call}`],
    ['repeats the same cursor', () => 'stuck'],
  ])(
    'stops paging and refetches when the server %s',
    async (_, cursorFor) => {
      const seed = message('seed', '2026-09-05T12:00:00Z');
      let afterCalls = 0;
      const fetchPage = vi.fn(
        async (cursor: { after?: string }): Promise<FeedPageRes> => {
          if (!cursor.after) {
            return {
              feed: [seed],
              startCursor: seed.id,
              nextCursor: seed.id,
              hasMore: false,
              hasMoreNewer: false,
            };
          }
          afterCalls += 1;
          const item = message(`newer-${afterCalls}`, '2026-09-05T12:01:00Z');
          return {
            feed: [item],
            startCursor: cursorFor(afterCalls),
            nextCursor: item.id,
            hasMore: false,
            hasMoreNewer: true,
          };
        },
      );
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: Infinity } },
      });
      const queryKey = ['feed', 'sync'];
      client.setQueryData(feedQueryKeyFor(queryKey), {
        pages: [
          {
            feed: [seed],
            startCursor: seed.id,
            nextCursor: seed.id,
            hasMore: false,
            hasMoreNewer: false,
          },
        ],
        pageParams: [null],
      });

      const { unmount } = renderHook(
        () => useFeedQuery({ enabled: true, pageSize: 1, queryKey, fetchPage }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
          ),
        },
      );

      await waitFor(() =>
        expect(fetchPage).toHaveBeenCalledWith({}, expect.any(Number)),
      );
      expect(afterCalls).toBeLessThanOrEqual(20);
      unmount();
      client.clear();
    },
  );
});

describe('useFeedQuery browser recovery', () => {
  for (const { olderPage, newMessage } of [
    { olderPage: false, newMessage: false },
    { olderPage: false, newMessage: true },
    { olderPage: true, newMessage: false },
    { olderPage: true, newMessage: true },
  ]) {
    it.each(['visibilitychange', 'focus', 'online'] as const)(
      `refreshes reply summaries on ${olderPage ? 'an older loaded page' : 'the newest page'} ${newMessage ? 'with a new message' : 'without new messages'} after %s`,
      async (event) => {
        const root = message('root', '2026-09-05T12:00:00Z');
        let items = olderPage
          ? [
              message('anchor-2', '2026-09-05T12:02:00Z'),
              message('anchor-1', '2026-09-05T12:01:00Z'),
              root,
            ]
          : [root];
        const fetchPage = vi.fn(
          async (
            cursor: { before?: string; after?: string },
            limit: number,
          ): Promise<FeedPageRes> => {
            const candidates = cursor.after
              ? items
                  .slice(
                    0,
                    items.findIndex((item) => item.id === cursor.after),
                  )
                  .reverse()
              : cursor.before
                ? items.slice(
                    items.findIndex((item) => item.id === cursor.before) + 1,
                  )
                : items;
            const feed = candidates.slice(0, limit);
            return {
              feed,
              startCursor: feed[0]?.id ?? null,
              nextCursor: feed.at(-1)?.id ?? null,
              hasMore: candidates.length > limit,
              hasMoreNewer: !!cursor.after && candidates.length > limit,
            };
          },
        );
        const client = new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: Infinity } },
        });
        const queryKey = ['feed', 'resume'];
        const { result, unmount } = renderHook(
          () =>
            useFeedQuery({ enabled: true, pageSize: 2, queryKey, fetchPage }),
          {
            wrapper: ({ children }: { children: ReactNode }) => (
              <QueryClientProvider client={client}>
                {children}
              </QueryClientProvider>
            ),
          },
        );
        await waitFor(() =>
          expect(result.current.data?.pages[0]).toBeDefined(),
        );
        if (olderPage)
          await act(async () => {
            await result.current.fetchNextPage();
          });
        const loadedItems = () =>
          result.current.data?.pages.flatMap((page) => page.feed);
        await waitFor(() =>
          expect(
            loadedItems()?.find((item) => item.id === root.id),
          ).toMatchObject({ replyCount: 0 }),
        );

        const replyUser = {
          id: 'user-b',
          name: 'User B',
          profilePicture: null,
        };
        const latestReplyAt = '2026-09-05T12:03:00Z';
        items = items.map((item) =>
          item.id === root.id
            ? { ...root, replyCount: 1, replyUsers: [replyUser], latestReplyAt }
            : item,
        );
        if (newMessage)
          items.unshift(message('new-regular-message', '2026-09-05T12:04:00Z'));
        act(() =>
          (event === 'visibilitychange' ? document : window).dispatchEvent(
            new Event(event),
          ),
        );

        if (newMessage)
          await waitFor(() =>
            expect(
              loadedItems()?.some((item) => item.id === 'new-regular-message'),
            ).toBe(true),
          );
        await waitFor(() =>
          expect(
            loadedItems()?.find((item) => item.id === root.id),
          ).toMatchObject({
            replyCount: 1,
            replyUsers: [replyUser],
            latestReplyAt,
          }),
        );
        unmount();
        client.clear();
      },
    );
  }
});
