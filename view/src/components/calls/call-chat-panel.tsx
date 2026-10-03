import { api } from '@/client/api-client';
import { Feed } from '@/components/feeds/feed';
import { MessageForm } from '@/components/messages/message-form';
import { MESSAGES_PAGE_SIZE } from '@/constants/message.constants';
import {
  PubSubMessageAction,
  PubSubMessageType,
} from '@/constants/pub-sub.constants';
import { preserveFeedImages, preserveFeedItemImages } from '@/lib/feed.utils';
import { patchRemovedMessage } from '@/lib/moderation.utils';
import { callPubSubTopic } from '@/lib/pub-sub.utils';
import { useAuthData } from '@/hooks/use-auth-data';
import { feedQueryKeyFor, useFeedQuery } from '@/hooks/use-feed-query';
import { useSubscription } from '@/hooks/use-subscription';
import { type FeedQuery, type FeedQueryPage } from '@/types/channel.types';
import { type ChannelRes } from '@/types/channel.types';
import { type MessageRes } from '@/types/message.types';
import { type PubSubMessage } from '@/types/shared.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NewMessagePayload {
  type: PubSubMessageType.MESSAGE;
  action?: PubSubMessageAction;
  message: MessageRes;
}

interface Props {
  serverId?: string;
  channel: ChannelRes;
  callId: string;
  readOnly?: boolean;
  initialFeedLimit?: number;
  focusedMessageId?: string;
}

export const CallChatPanel = ({
  serverId,
  channel,
  callId,
  readOnly = false,
  initialFeedLimit = MESSAGES_PAGE_SIZE,
  focusedMessageId,
}: Props) => {
  const feedBoxRef = useRef<HTMLDivElement>(null);
  const shouldScrollAfterSendRef = useRef(false);
  const dismissedTargetRef = useRef<string | null>(null);

  const queryClient = useQueryClient();
  const { inviteToken, me } = useAuthData();
  const { t } = useTranslation();

  const feedQueryKey = useMemo(
    () => [
      'servers',
      serverId,
      'channels',
      channel.id,
      'calls',
      callId,
      'feed',
      ...(inviteToken ? ['invite', inviteToken] : []),
    ],
    [callId, channel.id, inviteToken, serverId],
  );

  const [feedAnchorId, setFeedAnchorId] = useState<string | null>(null);

  const {
    feed,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isAnchored,
    isFetched: isFeedFetched,
    isFetchingNextPage,
    isFetchingPreviousPage,
    queryKey: activeFeedQueryKey,
  } = useFeedQuery({
    queryKey: feedQueryKey,
    anchorId: feedAnchorId || undefined,
    fetchPage: async (cursor, limit) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const result = await api.getCallFeed(
        serverId,
        channel.id,
        callId,
        cursor,
        Math.max(limit, initialFeedLimit),
      );
      const existingFeed = queryClient
        .getQueryData<FeedQuery>(
          feedQueryKeyFor(feedQueryKey, feedAnchorId || undefined),
        )
        ?.pages.flatMap((page) => page.feed);
      return {
        ...result,

        // Keep locally loaded image srcs from being lost on feed refresh
        feed: preserveFeedImages(existingFeed, result.feed),
      };
    },
    pageSize: MESSAGES_PAGE_SIZE,
    enabled: !!serverId,
  });

  const isFocusedMessageLoaded =
    !focusedMessageId || feed.some((item) => item.id === focusedMessageId);

  useEffect(() => {
    if (
      !focusedMessageId ||
      !isFeedFetched ||
      isFocusedMessageLoaded ||
      dismissedTargetRef.current === focusedMessageId
    ) {
      return;
    }
    setFeedAnchorId(focusedMessageId);
  }, [focusedMessageId, isFeedFetched, isFocusedMessageLoaded]);

  const returnToLatestFeed = useCallback(() => {
    dismissedTargetRef.current = focusedMessageId ?? null;
    setFeedAnchorId(null);
    shouldScrollAfterSendRef.current = true;
  }, [focusedMessageId]);

  useEffect(() => {
    if (!shouldScrollAfterSendRef.current) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      shouldScrollAfterSendRef.current = false;
      if (feedBoxRef.current) {
        feedBoxRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [feed]);

  const scrollToBottom = () => {
    if (feedBoxRef.current && feedBoxRef.current.scrollTop >= -200) {
      feedBoxRef.current.scrollTop = 0;
    }
  };

  useSubscription(
    callPubSubTopic('new-message', serverId, channel.id, callId, me?.id),
    {
      onMessage: (event) => {
        const { body }: PubSubMessage<NewMessagePayload> = JSON.parse(
          event.data,
        );
        if (!body) {
          return;
        }

        if (body.action === PubSubMessageAction.REMOVED) {
          patchRemovedMessage(queryClient, serverId, channel.id, body.message);
          return;
        }

        if (body.type === PubSubMessageType.MESSAGE) {
          const messagePayload = body.message;
          const incomingFeedItem = {
            ...messagePayload,
            type: 'message' as const,
          };

          queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
            if (!oldData) {
              return {
                pages: [{ feed: [incomingFeedItem] }],
                pageParams: [null],
              };
            }
            const pages = oldData.pages.map((page, index): FeedQueryPage => {
              const existingIndex = page.feed.findIndex(
                (item) =>
                  item.type === 'message' && item.id === messagePayload.id,
              );
              if (existingIndex !== -1) {
                const updatedFeed = [...page.feed];
                const existingMessage = page.feed[existingIndex];
                updatedFeed[existingIndex] = preserveFeedItemImages(
                  existingMessage.type === 'message'
                    ? existingMessage
                    : undefined,
                  incomingFeedItem,
                );
                updatedFeed.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                );
                return { ...page, feed: updatedFeed };
              }
              if (index === 0) {
                const updatedFeed = [incomingFeedItem, ...page.feed];
                updatedFeed.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                );
                return { ...page, feed: updatedFeed };
              }
              return page;
            });
            return { pages, pageParams: oldData.pageParams };
          });
        }

        scrollToBottom();
      },
      enabled: !!me && !!serverId,
    },
  );

  return (
    <section
      aria-label={t('calls.headers.inCallChat')}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="border-b border-[--color-border] px-3 py-2.5">
        <h2 className="text-sm font-semibold">
          {t('calls.headers.inCallChat')}
        </h2>
        <p className="text-muted-foreground text-xs">
          {t('calls.descriptions.inCallChat')}
        </p>
      </div>
      <Feed
        channel={channel}
        callId={callId}
        feedBoxRef={feedBoxRef}
        onLoadMore={fetchNextPage}
        feed={feed}
        feedQueryKey={activeFeedQueryKey}
        isLastPage={!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        isAnchored={isAnchored}
        hasNewerPage={hasPreviousPage}
        isLoadingNewer={isFetchingPreviousPage}
        onLoadNewer={() => void fetchPreviousPage({ cancelRefetch: false })}
        onJumpToLatest={returnToLatestFeed}
        focusedMessageId={focusedMessageId}
        scrollMode={readOnly ? 'natural' : 'bottom-anchored'}
      />
      {!readOnly && (
        <MessageForm
          channelId={channel.id}
          callId={callId}
          showActions={false}
          onSend={returnToLatestFeed}
        />
      )}
    </section>
  );
};
