import { ProposalMetadata } from '@/components/polls/proposals/inline-proposal/proposal-metadata';
import { AttachedImageList } from '@/components/images/attached-image-list';
import { ProposalStatusBadge } from '@/components/polls/proposals/inline-proposal/proposal-status-badge';
import { VoteProgressDialog } from '@/components/polls/proposals/inline-proposal/vote-progress-dialog';
import { ProposalAction } from '@/components/polls/proposals/proposal-actions/proposal-action';
import { ProposalMenu } from '@/components/polls/proposals/proposal-menu';
import { ProposalSettingsDialog } from '@/components/polls/proposals/proposal-settings-dialog';
import { ProposalVoteButtons } from '@/components/polls/proposals/proposal-vote-buttons';
import { FormattedText } from '@/components/shared/formatted-text';
import { CardAction } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useVotingDeadline } from '@/hooks/use-voting-deadline';
import { useVotingDeadlineLabel } from '@/hooks/use-voting-deadline-label';
import { cn } from '@/lib/shared.utils';
import { type CallArtifactRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { type CurrentUser } from '@/types/user.types';
import { type QueryKey } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuLoaderCircle } from 'react-icons/lu';

export type SourceCallContext = 'in-call' | 'this-call' | 'another-call';

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  feedQueryKey?: QueryKey;
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
  variant?: 'inline' | 'forum';
  votingDisabled?: boolean;
  votingDisabledReason?: string;
  updateCachedProposal?: (update: (proposal: PollRes) => PollRes) => void;
}

export const ProposalContent = ({
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
  variant = 'inline',
  votingDisabled = false,
  votingDisabledReason,
  updateCachedProposal,
}: Props) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isVoteProgressDialogOpen, setIsVoteProgressDialogOpen] =
    useState(false);

  const { t } = useTranslation();

  // The feed patches its call item as the call ends, so it leads the snapshot
  const sourceCallStatus = sourceCall?.status ?? poll.sourceCallStatus;

  const isSourceCallActive =
    sourceCallStatus === 'starting' || sourceCallStatus === 'active';
  const sourceCallHasEnded = !!poll.sourceCallId && !isSourceCallActive;

  const sourceCallLabel = {
    'in-call': t('proposals.labels.createdInCall'),
    'this-call': t('proposals.labels.createdInThisCall'),
    'another-call': t('proposals.labels.createdInAnotherCall'),
  }[sourceCallContext];

  const { id, body, myVote, config, action, stage, votes, memberCount } = poll;
  const deadlineHasPassed = useVotingDeadline(config.closingAt);

  const { hasEnded: votingHasEnded, label: deadlineLabel } =
    useVotingDeadlineLabel(config.closingAt, stage === 'voting');

  // The server closes the proposal on its own schedule, so the deadline can
  // pass while the stage is still open
  const isFinalizing =
    deadlineHasPassed && stage !== 'ratified' && stage !== 'closed';

  return (
    <>
      {variant === 'inline' && (
        <ProposalMenu
          me={me}
          poll={poll}
          channel={channel}
          canMoveToForum={canMoveToForum}
          feedQueryKey={feedQueryKey}
          onOpenThread={onOpenThread}
          onCopyThreadLink={onCopyThreadLink}
          onViewVoteProgress={() => setIsVoteProgressDialogOpen(true)}
          onViewSettings={() => setIsSettingsDialogOpen(true)}
        />
      )}
      <ProposalMetadata
        decisionMakingModel={config.decisionMakingModel ?? 'consensus'}
        actionType={action?.actionType}
        createdAt={variant === 'forum' ? poll.createdAt : undefined}
        variant={variant}
        onClick={() => setIsSettingsDialogOpen(true)}
      />
      <ProposalSettingsDialog
        actionType={action?.actionType}
        config={config}
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />

      {body && <FormattedText text={body} className="pt-1 pb-2" />}

      {poll.images.length > 0 && (
        <AttachedImageList
          images={poll.images}
          channelId={channel.id}
          pollId={poll.id}
          onImageLoad={onImageLoad}
          imageClassName="max-h-128 rounded-lg object-contain"
        />
      )}

      {action && (
        <ProposalAction action={action} channelId={channel.id} pollId={id} />
      )}

      <CardAction className="flex w-full flex-wrap gap-2">
        <ProposalVoteButtons
          pollId={id}
          channel={channel}
          feedQueryKey={feedQueryKey}
          myVote={myVote}
          stage={stage}
          decisionMakingModel={config.decisionMakingModel ?? 'consensus'}
          config={config}
          votes={votes}
          memberCount={memberCount}
          closingAt={config.closingAt}
          disabled={votingDisabled || sourceCallHasEnded}
          disabledReason={
            votingDisabled
              ? votingDisabledReason
              : t('proposals.prompts.noVotingAfterCallEnd')
          }
          onVoteSuccess={onPollChange}
          updateCachedProposal={updateCachedProposal}
        />
      </CardAction>

      <Separator className="mt-5 mb-2.5" />

      <div
        className={cn(
          'flex min-w-0 flex-wrap items-center justify-between gap-2',
          variant === 'forum' && 'pt-3',
        )}
      >
        <div className="text-muted-foreground flex min-w-0 flex-wrap text-sm">
          <VoteProgressDialog
            votes={votes ?? []}
            config={config}
            memberCount={memberCount}
            stage={stage}
            closedReason={poll.closedReason}
            isOpen={isVoteProgressDialogOpen}
            onOpenChange={setIsVoteProgressDialogOpen}
          />
          <div className="flex items-center">
            <span className="px-1.5" aria-hidden="true">
              {MIDDOT_WITH_SPACES.trim()}
            </span>
            <button
              type="button"
              className="focus-visible:ring-ring cursor-pointer rounded-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              {votingHasEnded ? (
                <>
                  <span className="hidden @sm:inline">{deadlineLabel}</span>
                  <span className="@sm:hidden">{t('time.ended')}</span>
                </>
              ) : (
                (deadlineLabel ?? t('time.infinity'))
              )}
            </button>
          </div>
          {isFinalizing && (
            <div className="flex items-center">
              <span className="px-1.5" aria-hidden="true">
                {MIDDOT_WITH_SPACES.trim()}
              </span>
              <LuLoaderCircle
                className="mr-1.5 size-3.5 shrink-0 animate-spin"
                aria-hidden="true"
              />
              <span>{t('proposals.outcomes.finalizing')}</span>
            </div>
          )}
        </div>
        <ProposalStatusBadge
          poll={poll}
          sourceCallHasEnded={sourceCallHasEnded}
          onClick={() => setIsVoteProgressDialogOpen(true)}
        />
      </div>

      {poll.sourceCallId && stage === 'voting' && (
        <div className="text-muted-foreground text-sm">
          {sourceCallLabel}
          {MIDDOT_WITH_SPACES}
          {isSourceCallActive && onJoinCall ? (
            <button
              type="button"
              className="text-primary cursor-pointer underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
              aria-label={t('calls.actions.joinActiveVideo')}
              disabled={isJoiningSourceCall}
              onClick={() => onJoinCall(poll.sourceCallId!)}
            >
              {t('calls.actions.joinCall')}
            </button>
          ) : (
            <a
              href={`#call-${poll.sourceCallId}`}
              className="text-primary underline-offset-4 hover:underline"
              onClick={(event) => {
                if (!onViewCall) return;
                event.preventDefault();
                onViewCall(poll.sourceCallId!);
              }}
            >
              {t('proposals.actions.viewCall')}
            </a>
          )}
        </div>
      )}
    </>
  );
};
