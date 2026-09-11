import { CallArtifact } from '@/components/calls/call-artifact';
import { WelcomeMessage } from '@/components/invites/welcome-message';
import { BotMessage } from '@/components/messages/bot-message';
import { Message } from '@/components/messages/message';
import { InlinePoll } from '@/components/polls/inline-poll';
import { InlineProposal } from '@/components/polls/proposals/inline-proposal/inline-proposal';
import { ProposalForumReference } from '@/components/polls/proposals/proposal-forum-reference';
import { Button } from '@/components/ui/button';
import { LocalStorageKeys } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useFocusHighlight } from '@/hooks/use-focus-highlight';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useServerData } from '@/hooks/use-server-data';
import { cn, t } from '@/lib/shared.utils';
import { useAppStore } from '@/store/app.store';
import { type ChannelRes, type FeedItemRes } from '@/types/channel.types';
import { type QueryKey } from '@tanstack/react-query';
import { type RefObject, useEffect, useMemo, useState } from 'react';
import { MdArrowDownward } from 'react-icons/md';
import { type ThreadIdentity } from '@/types/message.types';
import { copyThreadLink } from '@/lib/thread.utils';
import { toast } from 'sonner';

type FeedScrollMode = 'bottom-anchored' | 'natural';

interface Props {
  channel?: ChannelRes;
  feed: FeedItemRes[];
  feedQueryKey: QueryKey;
  feedBoxRef: RefObject<HTMLDivElement | null>;
  focusedDecisionId?: string;
  focusedMessageId?: string;
  focusedDecisionRequestKey?: string;
  onFocusedDecisionHandled?: () => void;
  isLastPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  isAnchored?: boolean;
  hasNewerPage?: boolean;
  isLoadingNewer?: boolean;
  onLoadNewer?: () => void;
  onJumpToLatest?: () => void;
  isJoiningCall?: boolean;
  onJoinCall?: (callId: string) => void;
  scrollMode?: FeedScrollMode;
  onOpenThread?: (thread: ThreadIdentity) => void;
}

const copyLinkToThread = (thread: ThreadIdentity) => {
  copyThreadLink(thread);
  toast(t('messages.prompts.linkCopied'));
};

export const Feed = ({
  channel,
  feed,
  feedQueryKey,
  feedBoxRef,
  focusedDecisionId,
  focusedMessageId,
  focusedDecisionRequestKey,
  onFocusedDecisionHandled,
  isLastPage,
  isLoadingMore,
  onLoadMore,
  isAnchored = false,
  hasNewerPage = false,
  isLoadingNewer = false,
  onLoadNewer,
  onJumpToLatest,
  isJoiningCall,
  onJoinCall,
  scrollMode = 'bottom-anchored',
  onOpenThread,
}: Props) => {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [openCallDetailsId, setOpenCallDetailsId] = useState<string | null>(
    null,
  );

  const { isAppLoading } = useAppStore();
  const { me, isAnon, isLoggedIn } = useAuthData();
  const { serverId } = useServerData();

  const isBottomAnchored = scrollMode === 'bottom-anchored';

  const feedTopRef = useInfiniteScroll({
    hasNextPage: isBottomAnchored && feed.length > 0 && !isLastPage,
    isLoadingMore,
    onLoadMore,
  });

  const feedBottomRef = useInfiniteScroll({
    hasNextPage: hasNewerPage && feed.length > 0 && !!onLoadNewer,
    isLoadingMore: isLoadingNewer,
    onLoadMore: () => onLoadNewer?.(),
  });

  // Bottom is DOM start under `column-reverse`, so the marker moves with it
  const feedBottom = (isAnchored || hasNewerPage) && (
    <div className="sticky bottom-0 z-10 flex flex-col items-center gap-1">
      <div ref={feedBottomRef} className="pt-0.5" />
      {isAnchored && onJumpToLatest && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          data-testid="feed-jump-to-latest"
          className="shadow-sm"
          disabled={isLoadingNewer}
          onClick={onJumpToLatest}
        >
          <MdArrowDownward className="size-4" />
          {isLoadingNewer
            ? t('channels.actions.loadingNewer')
            : t('channels.actions.jumpToLatest')}
        </Button>
      )}
    </div>
  );

  const visibleFeed = useMemo(
    () => (isBottomAnchored ? feed : [...feed].reverse()),
    [feed, isBottomAnchored],
  );
  const callsById = useMemo(() => {
    return new Map(
      feed
        .filter((item) => item.type === 'call')
        .map((call) => [call.id, call]),
    );
  }, [feed]);

  useEffect(() => {
    if (
      !isAppLoading &&
      (!isLoggedIn || isAnon) &&
      !localStorage.getItem(LocalStorageKeys.HideWelcomeMessage)
    ) {
      setShowWelcomeMessage(true);
    }
  }, [isLoggedIn, isAppLoading, isAnon]);

  useFocusHighlight({
    containerRef: feedBoxRef,
    targetSelector: focusedDecisionId
      ? `[data-decision-id="${CSS.escape(focusedDecisionId)}"]`
      : null,
    requestKey: focusedDecisionRequestKey,
    revision: feed,
    block: 'start',
    onHandled: onFocusedDecisionHandled,
  });

  useFocusHighlight({
    containerRef: feedBoxRef,
    targetSelector: focusedMessageId
      ? `[data-message-id="${CSS.escape(focusedMessageId)}"]`
      : null,
    requestKey: focusedDecisionRequestKey,
    revision: feed,
    block: 'center',
    onHandled: onFocusedDecisionHandled,
  });

  return (
    <div
      ref={feedBoxRef}
      data-testid="feed"
      className={cn(
        'flex min-w-0 flex-1 gap-4.5 overflow-x-hidden overflow-y-scroll px-3.5 pt-2.5 pb-4',
        isBottomAnchored ? 'flex-col-reverse' : 'flex-col',
      )}
    >
      {showWelcomeMessage && (
        <WelcomeMessage onDismiss={() => setShowWelcomeMessage(false)} />
      )}

      {isBottomAnchored && feedBottom}

      {visibleFeed.map((item) => {
        if (!channel) {
          return null;
        }
        if (item.type === 'poll') {
          if (item.pollType === 'proposal') {
            const sourceCall = item.sourceCallId
              ? callsById.get(item.sourceCallId)
              : undefined;

            return (
              <InlineProposal
                key={`poll-${item.id}`}
                poll={item}
                channel={channel}
                feedQueryKey={feedQueryKey}
                me={me}
                sourceCall={sourceCall}
                isJoiningSourceCall={isJoiningCall}
                onJoinCall={onJoinCall}
                onViewCall={setOpenCallDetailsId}
                canMoveToForum
                onOpenThread={
                  onOpenThread &&
                  (() => onOpenThread({ rootKind: 'poll', rootId: item.id }))
                }
                onCopyThreadLink={
                  onOpenThread &&
                  (() => copyLinkToThread({ rootKind: 'poll', rootId: item.id }))
                }
              />
            );
          }

          return (
            <InlinePoll
              key={`poll-${item.id}`}
              poll={item}
              channel={channel}
              feedQueryKey={feedQueryKey}
              me={me}
              onOpenThread={
                onOpenThread &&
                (() => onOpenThread({ rootKind: 'poll', rootId: item.id }))
              }
              onCopyThreadLink={
                onOpenThread &&
                (() => copyLinkToThread({ rootKind: 'poll', rootId: item.id }))
              }
            />
          );
        }
        if (item.type === 'proposalMoved') {
          return (
            <ProposalForumReference
              key={`proposal-moved-${item.id}`}
              reference={item}
              me={me}
            />
          );
        }
        if (item.type === 'call') {
          return (
            <CallArtifact
              key={`call-${item.id}`}
              call={item}
              channel={channel}
              serverId={serverId}
              me={me}
              isJoining={isJoiningCall}
              onJoinCall={onJoinCall}
              detailsOpen={openCallDetailsId === item.id}
              onDetailsOpenChange={(open) =>
                setOpenCallDetailsId(open ? item.id : null)
              }
            />
          );
        }
        if (item.bot) {
          return <BotMessage key={`message-${item.id}`} message={item} />;
        }
        return (
          <Message
            key={`message-${item.id}`}
            channelId={channel?.id}
            serverId={serverId}
            message={item}
            me={me}
            onOpenThread={
              onOpenThread &&
              ((rootId: string) => onOpenThread({ rootKind: 'message', rootId }))
            }
            onCopyThreadLink={
              onOpenThread &&
              ((rootId: string) =>
                copyLinkToThread({ rootKind: 'message', rootId }))
            }
          />
        );
      })}

      {/* Bottom is top due to `column-reverse` in the channel feed */}
      <div ref={feedTopRef} className="pb-0.5" />

      {!isBottomAnchored && feedBottom}
    </div>
  );
};
