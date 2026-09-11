import {
  ProposalContent,
  type SourceCallContext,
} from '@/components/polls/proposals/inline-proposal/proposal-content';
import { Card } from '@/components/ui/card';
import { MessageThreadSummary } from '@/components/messages/message-thread-summary';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { FOCUS_HIGHLIGHT_TARGET_CLASS_NAME } from '@/constants/style.constants';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { timeAgo } from '@/lib/time.utils';
import { type CallArtifactRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { type CurrentUser } from '@/types/user.types';
import { type QueryKey } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  feedQueryKey: QueryKey;
  me?: CurrentUser;
  onPollChange?: () => void;
  onViewCall?: (callId: string) => void;
  onJoinCall?: (callId: string) => void;
  sourceCall?: CallArtifactRes;
  sourceCallContext?: SourceCallContext;
  isJoiningSourceCall?: boolean;
  canMoveToForum?: boolean;
  onOpenThread?: () => void;
  onCopyThreadLink?: () => void;
  onImageLoad?: () => void;
}

export const InlineProposal = ({
  poll,
  channel,
  feedQueryKey,
  me,
  onPollChange,
  onViewCall,
  onJoinCall,
  sourceCall,
  sourceCallContext = 'in-call',
  isJoiningSourceCall = false,
  canMoveToForum = false,
  onOpenThread,
  onCopyThreadLink,
  onImageLoad,
}: Props) => {
  const { t } = useTranslation();
  const { body, user, config, createdAt } = poll;

  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);
  const formattedDate = timeAgo(createdAt);

  const modelLabel = {
    consent: t('proposals.labels.consentProposal'),
    consensus: t('proposals.labels.consensusProposal'),
    'majority-vote': t('proposals.labels.majorityProposal'),
  }[config.decisionMakingModel ?? 'consensus'];
  const label = body ? `${modelLabel}: ${body}` : modelLabel;

  return (
    <article
      aria-label={label}
      data-decision-id={poll.id}
      tabIndex={-1}
      className={cn(
        FOCUS_HIGHLIGHT_TARGET_CLASS_NAME,
        '-mx-2 flex min-w-0 scroll-m-3 gap-4 rounded-lg px-2 pt-1 focus:outline-none',
      )}
    >
      <UserProfileDrawer
        name={truncatedName}
        userId={user.id}
        me={me}
        trigger={
          <button className="shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              imageId={user.profilePicture?.id}
              className="mt-0.5"
            />
          </button>
        }
      />

      <div className="max-w-full min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5 pb-1">
          <UserProfileDrawer
            name={truncatedName}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedName}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm">{formattedDate}</div>
        </div>

        <Card className="before:border-l-border @container relative max-w-full min-w-0 gap-3.5 rounded-md px-3 py-3.5 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
          <ProposalContent
            poll={poll}
            channel={channel}
            feedQueryKey={feedQueryKey}
            me={me}
            onPollChange={onPollChange}
            onViewCall={onViewCall}
            onJoinCall={onJoinCall}
            sourceCall={sourceCall}
            sourceCallContext={sourceCallContext}
            isJoiningSourceCall={isJoiningSourceCall}
            canMoveToForum={canMoveToForum}
            onOpenThread={onOpenThread}
            onCopyThreadLink={onCopyThreadLink}
            onImageLoad={onImageLoad}
          />
        </Card>
        {onOpenThread && poll.replyCount > 0 && (
          <MessageThreadSummary
            replyCount={poll.replyCount}
            replyUsers={poll.replyUsers || []}
            latestReplyAt={poll.latestReplyAt}
            onOpen={onOpenThread}
          />
        )}
      </div>
    </article>
  );
};
