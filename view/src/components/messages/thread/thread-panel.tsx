import { api } from '@/client/api-client';
import { Message } from '@/components/messages/message';
import { MessageForm } from '@/components/messages/message-form';
import { ThreadPanelSkeleton } from '@/components/messages/thread/thread-panel-skeleton';
import { getThreadQueryKey } from '@/components/messages/thread/thread-query.utils';
import { anchoredQueryKey } from '@/lib/query.utils';
import { InlinePoll } from '@/components/polls/inline-poll';
import { InlineProposal } from '@/components/polls/proposals/inline-proposal/inline-proposal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthData } from '@/hooks/use-auth-data';
import { useFocusHighlight } from '@/hooks/use-focus-highlight';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useMessageRemoval } from '@/hooks/use-message-removal';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useServerData } from '@/hooks/use-server-data';
import { subscribeToBrowserResume } from '@/lib/browser.utils';
import { preserveMessageImages } from '@/lib/feed.utils';
import { type ChannelRes } from '@/types/channel.types';
import {
  type MessageRes,
  type MovedThreadErrorRes,
  type ThreadIdentity,
  type ThreadQuery,
} from '@/types/message.types';
import { type PollRes } from '@/types/poll.types';
import {
  useInfiniteQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdClose, MdErrorOutline } from 'react-icons/md';
import { useNavigate, useSearchParams } from 'react-router-dom';

const THREAD_PAGE_SIZE = 50;

interface Props {
  channel: ChannelRes;
  thread: ThreadIdentity;
  rootPoll?: PollRes;
  feedQueryKey: QueryKey;
  onClose: () => void;
}

const mergeMessageImages = (
  existing: MessageRes | undefined,
  incoming: MessageRes,
): MessageRes => ({
  ...incoming,
  images: preserveMessageImages(existing?.images, incoming.images),
});

export const ThreadPanel = ({
  channel,
  thread,
  rootPoll,
  feedQueryKey,
  onClose,
}: Props) => {
  const shouldScrollAfterReplyRef = useRef(false);
  const previousReplyCountRef = useRef<number | undefined>(undefined);

  const {
    containerRef: scrollContainerRef,
    scrollToBottom,
    handleContentLoad,
  } = useScrollToBottom<HTMLDivElement>();

  const { inviteToken, me } = useAuthData();
  const { server, serverId } = useServerData();
  const getRemoveHandler = useMessageRemoval({ channelId: channel.id });

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const focusedReplyId = searchParams.get('reply');

  const threadKey = `${thread.rootKind}:${thread.rootId}`;
  const [aroundReply, setAroundReply] = useState({
    threadKey,
    replyId: focusedReplyId,
  });
  if (aroundReply.threadKey !== threadKey) {
    setAroundReply({ threadKey, replyId: focusedReplyId });
  }

  const queryKey = anchoredQueryKey(
    getThreadQueryKey(
      serverId,
      channel.id,
      thread.rootKind,
      thread.rootId,
      inviteToken,
    ),
    aroundReply.replyId || undefined,
  );
  const threadQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const cursor = pageParam
        ? { before: pageParam }
        : { around: aroundReply.replyId || undefined };
      const result =
        thread.rootKind === 'message'
          ? await api.getMessageThreadReplies(
              serverId,
              channel.id,
              thread.rootId,
              cursor,
              THREAD_PAGE_SIZE,
            )
          : await api.getPollThreadReplies(
              serverId,
              channel.id,
              thread.rootId,
              cursor,
              THREAD_PAGE_SIZE,
            );
      const existing = queryClient.getQueryData<ThreadQuery>(queryKey);
      const existingMessages = new Map(
        existing?.pages
          .flatMap((page) => page.replies)
          .map((message) => [message.id, message]),
      );
      return {
        ...result,
        root:
          thread.rootKind === 'message'
            ? mergeMessageImages(
                existing?.pages[0]?.root as MessageRes | undefined,
                result.root as MessageRes,
              )
            : result.root,
        replies: result.replies.map((reply) =>
          mergeMessageImages(existingMessages.get(reply.id), reply),
        ),
      };
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!serverId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    // A moved proposal answers with 410 and a redirect target, so retrying any
    // client error only delays handling an answer the server already gave
    retry: (failureCount, error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
  const refetchThread = threadQuery.refetch;

  // Catch up on replies missed while the open panel was inactive or offline
  useEffect(() => {
    if (!serverId) {
      return;
    }
    return subscribeToBrowserResume(() => void refetchThread());
  }, [refetchThread, serverId]);

  const queriedRoot = threadQuery.data?.pages[0]?.root;
  const movedTo =
    thread.rootKind === 'poll' &&
    isAxiosError<MovedThreadErrorRes>(threadQuery.error) &&
    threadQuery.error.response?.status === 410
      ? threadQuery.error.response.data?.movedTo
      : undefined;

  // Votes only update the feed cache, so read a poll root from there instead of
  // from the thread query to keep the panel in sync
  const root =
    thread.rootKind === 'poll' && rootPoll && queriedRoot
      ? rootPoll
      : queriedRoot;
  const replyCountLabel = root?.replyCount
    ? t('messages.labels.replyCount', { count: root.replyCount })
    : t('messages.labels.replies');

  const replies = useMemo(() => {
    const chronologicalReplies = [...(threadQuery.data?.pages || [])]
      .reverse()
      .flatMap((page) => page.replies);
    return [
      ...new Map(
        chronologicalReplies.map((reply) => [reply.id, reply]),
      ).values(),
    ];
  }, [threadQuery.data?.pages]);

  useEffect(() => {
    previousReplyCountRef.current = undefined;
    shouldScrollAfterReplyRef.current = false;
  }, [thread.rootId, thread.rootKind]);

  useEffect(() => {
    if (!movedTo || !server?.slug) {
      return;
    }
    void navigate(
      `/s/${server.slug}/c/${movedTo.destinationChannelId}/posts/${movedTo.forumPostId}`,
      { replace: true },
    );
  }, [movedTo, navigate, server?.slug]);

  useEffect(() => {
    const previousReplyCount = previousReplyCountRef.current;
    previousReplyCountRef.current = replies.length;
    const receivedReply =
      previousReplyCount !== undefined && replies.length > previousReplyCount;
    if (!receivedReply && !shouldScrollAfterReplyRef.current) {
      return;
    }
    shouldScrollAfterReplyRef.current = false;
    scrollToBottom();
  }, [replies.length, scrollToBottom]);

  const hasNewerReplies =
    !!aroundReply.replyId && !!threadQuery.data?.pages[0]?.hasMoreNewer;

  const jumpToLatestReplies = () => {
    setAroundReply({ threadKey, replyId: null });
  };

  const clearFocusedReply = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('reply');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // An older reply would otherwise be missed, since the panel opens at its end
  useFocusHighlight({
    containerRef: scrollContainerRef,
    targetSelector: focusedReplyId
      ? `[data-message-id="${CSS.escape(focusedReplyId)}"]`
      : null,
    revision: replies,
    block: 'center',
    onHandled: clearFocusedReply,
  });

  return (
    <aside
      data-testid="thread-panel"
      aria-label={t('messages.threads.title')}
      className="bg-background flex h-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex h-13.75 shrink-0 items-center gap-2 border-b px-3">
        {!isDesktop && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('messages.threads.back')}
            onClick={onClose}
          >
            <MdArrowBack className="size-5" />
          </Button>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold">{t('messages.threads.title')}</h2>
          <p className="text-muted-foreground truncate text-xs">
            {t('messages.threads.channel', { channel: channel.name })}
          </p>
        </div>
        {isDesktop && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto"
            aria-label={t('messages.threads.close')}
            onClick={onClose}
          >
            <MdClose className="size-5" />
          </Button>
        )}
      </header>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        {threadQuery.isLoading && <ThreadPanelSkeleton />}

        {threadQuery.isError && !movedTo && (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <MdErrorOutline className="text-muted-foreground size-8" />
            <div>
              <p className="font-medium">
                {t('messages.threads.notFoundTitle')}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('messages.threads.notFoundDescription')}
              </p>
            </div>
          </div>
        )}

        {root && (
          <div className="flex min-h-full flex-col px-4 pt-5 pb-4">
            {thread.rootKind === 'message' ? (
              <Message
                message={root as MessageRes}
                me={me}
                onRemove={getRemoveHandler(root as MessageRes)}
                serverId={serverId}
                channelId={channel.id}
                onImageLoad={handleContentLoad}
              />
            ) : (root as PollRes).pollType === 'proposal' ? (
              <InlineProposal
                poll={root as PollRes}
                channel={channel}
                feedQueryKey={feedQueryKey}
                me={me}
                canMoveToForum
                onImageLoad={handleContentLoad}
              />
            ) : (
              <InlinePoll
                poll={root as PollRes}
                channel={channel}
                feedQueryKey={feedQueryKey}
                me={me}
                onImageLoad={handleContentLoad}
              />
            )}

            <div
              className="text-muted-foreground my-5 flex items-center gap-3 text-xs font-medium"
              role="separator"
              aria-label={replyCountLabel}
            >
              <span>{replyCountLabel}</span>
              <Separator className="flex-1" />
            </div>

            {threadQuery.hasNextPage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground mb-4 self-center"
                disabled={threadQuery.isFetchingNextPage}
                onClick={() => void threadQuery.fetchNextPage()}
              >
                {threadQuery.isFetchingNextPage
                  ? t('messages.threads.loadingOlder')
                  : t('messages.threads.loadOlder')}
              </Button>
            )}

            <div className="flex flex-1 flex-col gap-4" aria-live="polite">
              {replies.map((reply) => (
                <Message
                  key={reply.id}
                  message={reply}
                  me={me}
                  onRemove={getRemoveHandler(reply)}
                  serverId={serverId}
                  channelId={channel.id}
                  onImageLoad={handleContentLoad}
                />
              ))}
              {!replies.length && (
                <p className="text-muted-foreground flex min-h-24 flex-1 items-center justify-center text-center text-sm">
                  {t('messages.threads.empty')}
                </p>
              )}
              {hasNewerReplies && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground self-center"
                  onClick={jumpToLatestReplies}
                >
                  {t('messages.threads.jumpToLatest')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {root && (
        <div className="shrink-0">
          <MessageForm
            key={`${thread.rootKind}-${thread.rootId}`}
            channelId={channel.id}
            thread={thread}
            showActions={false}
            focusOnTyping={false}
            onSend={() => {
              shouldScrollAfterReplyRef.current = true;
              if (aroundReply.replyId) {
                jumpToLatestReplies();
              }
            }}
          />
        </div>
      )}
    </aside>
  );
};
