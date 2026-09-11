import { api } from '@/client/api-client';
import { ForumPostMenu } from '@/components/forum/forum-post-menu';
import { ForumProposalPresentation } from '@/components/forum/forum-proposal-presentation';
import { Message } from '@/components/messages/message';
import { MessageForm } from '@/components/messages/message-form';
import { ProposalSettingsDialog } from '@/components/polls/proposals/proposal-settings-dialog';
import { FormattedText } from '@/components/shared/formatted-text';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/users/user-avatar';
import { useAuthData } from '@/hooks/use-auth-data';
import { useFocusHighlight } from '@/hooks/use-focus-highlight';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useServerData } from '@/hooks/use-server-data';
import { anchoredQueryKey } from '@/lib/query.utils';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import { type ChannelRes } from '@/types/channel.types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdLockOutline } from 'react-icons/md';
import { Link, useSearchParams } from 'react-router-dom';

const FORUM_REPLIES_PAGE_SIZE = 50;

interface Props {
  channel: ChannelRes;
  postId: string;
  isPane?: boolean;
}

export const ForumPostDetail = ({ channel, postId, isPane = false }: Props) => {
  const [isProposalSettingsOpen, setIsProposalSettingsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { inviteToken, me } = useAuthData();
  const { serverId, serverPath } = useServerData();

  const { t } = useTranslation();

  const focusedReplyId = searchParams.get('reply');

  const [aroundReply, setAroundReply] = useState({
    postId,
    replyId: focusedReplyId,
  });
  if (aroundReply.postId !== postId) {
    setAroundReply({ postId, replyId: focusedReplyId });
  }

  const postQueryKey = anchoredQueryKey(
    [
      'servers',
      serverId,
      'channels',
      channel.id,
      'forum',
      'posts',
      postId,
      inviteToken,
    ],
    aroundReply.replyId || undefined,
  );

  const postQuery = useInfiniteQuery({
    queryKey: postQueryKey,
    queryFn: ({ pageParam }) => {
      if (!serverId) throw new Error('Server ID is required');
      const cursor = pageParam
        ? { before: pageParam }
        : { around: aroundReply.replyId || undefined };
      return api.getForumPostReplies(
        serverId,
        channel.id,
        postId,
        cursor,
        FORUM_REPLIES_PAGE_SIZE,
      );
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!serverId,
  });

  const post = postQuery.data?.pages[0]?.post;
  const replies = useMemo(() => {
    const chronologicalReplies = [...(postQuery.data?.pages || [])]
      .reverse()
      .flatMap((page) => page.post.replies);
    return [
      ...new Map(
        chronologicalReplies.map((reply) => [reply.id, reply]),
      ).values(),
    ];
  }, [postQuery.data?.pages]);

  const {
    containerRef: scrollContainerRef,
    scrollToBottom,
    handleContentLoad,
  } = useScrollToBottom<HTMLElement>();

  const shouldScrollAfterReplyRef = useRef(false);
  const wasNearBottomRef = useRef(true);
  const previousReplyCountRef = useRef<number | undefined>(undefined);
  const replyCount = post?.replyCount;

  useEffect(() => {
    setIsProposalSettingsOpen(false);
    shouldScrollAfterReplyRef.current = false;
    wasNearBottomRef.current = true;
    previousReplyCountRef.current = undefined;
  }, [postId]);

  useEffect(() => {
    const previousReplyCount = previousReplyCountRef.current;
    previousReplyCountRef.current = replyCount;
    if (replyCount === undefined) return;

    const receivedNewReply =
      previousReplyCount !== undefined && replyCount > previousReplyCount;
    if (
      !shouldScrollAfterReplyRef.current &&
      !(receivedNewReply && wasNearBottomRef.current)
    ) {
      return;
    }

    shouldScrollAfterReplyRef.current = false;
    wasNearBottomRef.current = true;
    scrollToBottom();
  }, [replyCount, scrollToBottom]);

  const hasNewerReplies =
    !!aroundReply.replyId && !!postQuery.data?.pages[0]?.hasMoreNewer;

  const jumpToLatestReplies = () => {
    setAroundReply({ postId, replyId: null });
  };

  const clearFocusedReply = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('reply');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useFocusHighlight({
    containerRef: scrollContainerRef,
    targetSelector: focusedReplyId
      ? `[data-message-id="${CSS.escape(focusedReplyId)}"]`
      : null,
    revision: replies,
    block: 'center',
    onHandled: clearFocusedReply,
  });

  const setScrollContainer = useCallback(
    (element: HTMLElement | null) => {
      scrollContainerRef.current = element;
      if (element) {
        wasNearBottomRef.current =
          element.scrollHeight - element.scrollTop - element.clientHeight <=
          200;
      }
    },
    [scrollContainerRef],
  );

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      wasNearBottomRef.current =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        200;
    }
  }, [scrollContainerRef]);

  if (!post) {
    return isPane ? (
      <aside className="bg-background min-w-0 flex-1" />
    ) : (
      <main className="min-h-0 flex-1" />
    );
  }

  const author = post.user.displayName || post.user.name;
  const isAuthor = me?.id === post.user.id;
  const replyCountLabel = t('forums.labels.replyCount', {
    count: post.replyCount,
  });

  const showForumPostMenu =
    post.proposal || (isAuthor && (post.status === 'open' || !post.proposal));

  const replyForm = (
    <MessageForm
      channelId={channel.id}
      forumPostId={post.id}
      showActions={false}
      disabled={post.status === 'closed'}
      onSend={() => {
        shouldScrollAfterReplyRef.current = true;
        if (aroundReply.replyId) {
          jumpToLatestReplies();
        }
      }}
    />
  );

  const detailContent = (
    <div
      className={cn(
        'mx-auto flex min-h-full w-full max-w-4xl flex-col gap-5 px-4 pt-6 md:px-5 md:py-6',
        isPane && 'max-w-none px-4',
        post.proposal && 'gap-4',
      )}
    >
      <article>
        <div className="flex items-start gap-3">
          <UserAvatar
            className="mt-1 shrink-0"
            name={author}
            userId={post.user.id}
            imageId={post.user.profilePicture?.id}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold">{post.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {author} · {timeAgo(post.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {post.status === 'closed' && (
                  <span className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MdLockOutline />
                    {t('forums.labels.closed')}
                  </span>
                )}
                {showForumPostMenu && (
                  <ForumPostMenu
                    channel={channel}
                    post={post}
                    isAuthor={isAuthor}
                    onViewProposalSettings={() =>
                      setIsProposalSettingsOpen(true)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <FormattedText text={post.body} className="mt-4 sm:ml-13" />
        {post.proposal && (
          <div className="sm:ml-13">
            <ForumProposalPresentation
              me={me}
              channel={channel}
              proposal={post.proposal}
              postQueryKey={postQueryKey}
              votingDisabled={post.status === 'closed'}
              votingDisabledReason={t('forums.prompts.closedPost')}
            />
          </div>
        )}
      </article>

      {post.proposal && (
        <ProposalSettingsDialog
          actionType={post.proposal.action?.actionType}
          config={post.proposal.config}
          open={isProposalSettingsOpen}
          onOpenChange={setIsProposalSettingsOpen}
        />
      )}

      <section className="flex flex-1 flex-col gap-4">
        <div
          className="text-muted-foreground flex items-center gap-3 text-xs font-medium"
          role="separator"
          aria-label={replyCountLabel}
        >
          <span>{replyCountLabel}</span>
          <Separator className="flex-1" />
        </div>
        {postQuery.hasNextPage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground self-center"
            disabled={postQuery.isFetchingNextPage}
            onClick={() => void postQuery.fetchNextPage()}
          >
            {postQuery.isFetchingNextPage
              ? t('messages.threads.loadingOlder')
              : t('messages.threads.loadOlder')}
          </Button>
        )}
        {replies.map((reply) => (
          <Message
            key={reply.id}
            message={reply}
            me={me}
            serverId={serverId}
            channelId={channel.id}
            onImageLoad={handleContentLoad}
          />
        ))}
        {!replies.length && (
          <p className="text-muted-foreground flex min-h-24 flex-1 items-center justify-center text-center text-base">
            {t('forums.prompts.noReplies')}
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
      </section>
    </div>
  );

  if (isPane) {
    return (
      <aside className="bg-background flex h-full min-w-0 flex-1 flex-col">
        <header className="flex h-13.75 shrink-0 items-center justify-between gap-3 border-b px-4">
          <h2 className="truncate font-medium">{post.title}</h2>
          <Button variant="ghost" size="icon" asChild>
            <Link
              to={`${serverPath}/c/${channel.id}`}
              aria-label={t('forums.actions.closePostPane')}
            >
              <MdClose className="size-6" />
            </Link>
          </Button>
        </header>
        <div
          ref={setScrollContainer}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          {detailContent}
        </div>
        <div className="shrink-0">{replyForm}</div>
      </aside>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div
        ref={setScrollContainer}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {detailContent}
      </div>
      <div className="shrink-0">{replyForm}</div>
    </main>
  );
};
