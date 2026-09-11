import { CallChatPanel } from '@/components/calls/call-chat-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { timeAgo } from '@/lib/time.utils';
import { type CallArtifactRes, type CallUserRes } from '@/types/call.types';
import { type ChannelRes } from '@/types/channel.types';
import { type CurrentUser } from '@/types/user.types';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuMessagesSquare, LuPhoneCall, LuVote } from 'react-icons/lu';

const formatDuration = (
  seconds: number,
  t: (key: string, values: Record<string, number>) => string,
) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${t('time.hours', { hours })} ${t('time.minutes', { minutes })}`;
  }
  if (minutes > 0) {
    return `${t('time.minutes', { minutes })} ${t('time.seconds', {
      seconds: remainingSeconds,
    })}`;
  }
  return t('time.seconds', { seconds: remainingSeconds });
};

const displayName = (user: CallUserRes) => {
  return user.displayName || user.name;
};

const formatCallTime = (
  timestamp: string | null | undefined,
  includeDate = false,
) => {
  if (!timestamp) {
    return null;
  }
  return dayjs(timestamp).format(includeDate ? 'MMM D, h:mm A' : 'h:mm A');
};

const formatCallDate = (timestamp: string) => {
  const date = dayjs(timestamp);
  return date.isSame(dayjs(), 'year')
    ? date.format('MMM D')
    : date.format('MMM D, YYYY');
};

const formatCompactCallTimeRange = (
  startedAt: string,
  endedAt: string | null | undefined,
) => {
  if (!endedAt) {
    return null;
  }

  const start = dayjs(startedAt);
  const end = dayjs(endedAt);

  if (!start.isSame(end, 'day')) {
    return {
      startedAt: start.format('MMM D, h:mm A'),
      endedAt: end.format('MMM D, h:mm A'),
    };
  }

  if (start.format('A') === end.format('A')) {
    return {
      startedAt: start.format('h:mm'),
      endedAt: end.format('h:mm A'),
    };
  }

  return {
    startedAt: start.format('h:mm A'),
    endedAt: end.format('h:mm A'),
  };
};

const CallUserAvatar = ({
  user,
  className = 'size-7',
}: {
  user: CallUserRes;
  className?: string;
}) => (
  <UserAvatar
    name={displayName(user)}
    userId={user.id}
    imageId={user.profilePicture?.id}
    className={className}
    fallbackClassName="text-xs"
    skipLoadAnimation
  />
);

interface Props {
  call: CallArtifactRes;
  channel: ChannelRes;
  serverId?: string;
  me?: CurrentUser;
  isJoining?: boolean;
  onJoinCall?: (callId: string) => void;
  detailsOpen?: boolean;
  onDetailsOpenChange?: (open: boolean) => void;
}

export const CallArtifact = ({
  call,
  channel,
  isJoining = false,
  me,
  onJoinCall,
  detailsOpen: controlledDetailsOpen,
  onDetailsOpenChange,
  serverId,
}: Props) => {
  const [uncontrolledDetailsOpen, setUncontrolledDetailsOpen] = useState(false);
  const detailsOpen = controlledDetailsOpen ?? uncontrolledDetailsOpen;

  const { t } = useTranslation();

  const isActive = call.status === 'starting' || call.status === 'active';
  const duration = formatDuration(call.durationSeconds, t);
  const participantCount = t('calls.labels.participantCount', {
    count: call.participantCount,
  });

  const starterName = displayName(call.startedBy);
  const truncatedStarterName = truncate(starterName, 18);
  const isCallToday = dayjs(call.createdAt).isSame(dayjs(), 'day');
  const formattedDate = timeAgo(call.createdAt);
  const endedAt = call.endedAt || undefined;

  const compactTimeRange = formatCompactCallTimeRange(call.createdAt, endedAt);
  const compactTimeRangeLabel = compactTimeRange
    ? t('calls.artifact.timeRange', {
        startedAt: compactTimeRange.startedAt,
        endedAt: compactTimeRange.endedAt,
      })
    : null;

  const detailsStartedAt = formatCallTime(call.createdAt, true);
  const detailsEndedAt = formatCallTime(endedAt, true);
  const messageCount = call.summary.messages;
  const decisionCount = call.summary.proposals + call.summary.polls;
  const callDate = formatCallDate(call.createdAt);

  const messageCountLabel = t('calls.artifact.messageCount', {
    count: messageCount,
  });
  const decisionCountLabel = t('calls.artifact.decisionCount', {
    count: decisionCount,
  });

  const timeline = isActive
    ? t('calls.artifact.startedAgo', { time: formattedDate })
    : isCallToday && compactTimeRangeLabel
      ? compactTimeRangeLabel
      : callDate;

  const participantNames = call.participants
    .map(displayName)
    .filter(Boolean)
    .join(', ');

  const setDetailsOpen = (open: boolean) => {
    onDetailsOpenChange?.(open);
    if (controlledDetailsOpen === undefined) {
      setUncontrolledDetailsOpen(open);
    }
  };

  const handleArtifactClick = () => {
    setDetailsOpen(true);
  };

  const renderDetailStat = (label: string, value: number) => (
    <div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-muted-foreground text-xs">{label}</div>
    </div>
  );

  return (
    <>
      <article className="flex max-w-full min-w-0 gap-4 pt-1">
        <UserProfileDrawer
          name={truncatedStarterName}
          userId={call.startedBy.id}
          me={me}
          trigger={
            <button className="shrink-0 cursor-pointer self-start">
              <CallUserAvatar user={call.startedBy} className="mt-0.5" />
            </button>
          }
        />

        <div className="max-w-full min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5 pb-1">
            <UserProfileDrawer
              name={truncatedStarterName}
              userId={call.startedBy.id}
              me={me}
              trigger={
                <button className="cursor-pointer font-medium">
                  {truncatedStarterName}
                </button>
              }
            />
            <div className="text-muted-foreground text-sm">{formattedDate}</div>
          </div>

          <Card className="before:border-l-border relative max-w-full min-w-0 gap-3.5 rounded-md px-3 py-3 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <button
                  type="button"
                  className={cn(
                    'flex max-w-full items-center gap-2 text-left',
                    !isActive && 'cursor-pointer',
                  )}
                  aria-label={t('calls.actions.viewDetails')}
                  onClick={handleArtifactClick}
                >
                  <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                    <LuPhoneCall className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                      {isActive
                        ? t('calls.artifact.activeTitle')
                        : t('calls.artifact.endedTitle')}
                    </h3>
                    <p className="text-muted-foreground truncate text-sm">
                      {t('calls.artifact.startedBy', {
                        name: displayName(call.startedBy),
                      })}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={cn(
                    'flex max-w-full flex-wrap items-center gap-2 text-left',
                    !isActive && 'cursor-pointer',
                  )}
                  aria-label={t('calls.actions.viewDetails')}
                  onClick={handleArtifactClick}
                >
                  <div className="flex shrink-0 -space-x-2">
                    {call.participants.slice(0, 4).map((participant) => (
                      <CallUserAvatar
                        key={participant.id}
                        user={participant}
                        className="border-card size-7 border-2"
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {participantCount}
                    {participantNames ? `: ${participantNames}` : ''}
                  </span>
                </button>

                <button
                  type="button"
                  className={cn(
                    'text-muted-foreground flex max-w-full flex-wrap gap-x-2 gap-y-1 text-left text-sm',
                    !isActive && 'cursor-pointer',
                  )}
                  aria-label={t('calls.actions.viewDetails')}
                  onClick={handleArtifactClick}
                >
                  <span className="whitespace-nowrap">{timeline}</span>

                  {!isActive && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">{duration}</span>
                    </>
                  )}

                  <span aria-hidden="true">·</span>

                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <LuMessagesSquare className="size-3.5" />
                    <span className="sm:hidden">{messageCount}</span>
                    <span className="hidden sm:inline">
                      {messageCountLabel}
                    </span>
                  </span>

                  <span aria-hidden="true">·</span>

                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <LuVote className="size-3.5" />
                    <span className="sm:hidden">{decisionCount}</span>
                    <span className="hidden sm:inline">
                      {decisionCountLabel}
                    </span>
                  </span>
                </button>
              </div>

              {isActive ? (
                <Button
                  className="w-full sm:w-auto"
                  aria-label={t('calls.actions.joinActiveVideo')}
                  disabled={isJoining}
                  onClick={(event) => {
                    event.stopPropagation();
                    onJoinCall?.(call.id);
                  }}
                >
                  {t('calls.actions.joinCall')}
                </Button>
              ) : (
                <Button
                  className="w-full sm:w-auto"
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDetailsOpen(true);
                  }}
                >
                  {t('calls.actions.viewDetails')}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </article>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="h-[90vh] max-h-[90vh] gap-4 overflow-hidden p-0 pt-12 md:flex md:min-w-4xl md:p-0 md:pt-12">
          <DialogHeader className="px-4 md:px-6">
            <DialogTitle>{t('calls.artifact.detailsTitle')}</DialogTitle>
            <DialogDescription>
              {t('calls.artifact.detailsDescription', {
                duration,
                participants: participantCount,
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-none">
            <aside className="border-border space-y-3 border-b px-4 pb-4 md:border-r md:border-b-0 md:px-6">
              <div className="space-y-2">
                <h4 className="text-xs font-medium">
                  {t('calls.artifact.times')}
                </h4>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <div>
                    {t('calls.artifact.startedAt', {
                      time: detailsStartedAt,
                    })}
                  </div>
                  {detailsEndedAt && (
                    <div>
                      {t('calls.artifact.endedAt', {
                        time: detailsEndedAt,
                      })}
                    </div>
                  )}
                  <div>{t('calls.artifact.duration', { duration })}</div>
                </div>
              </div>

              <Separator />

              {renderDetailStat(
                t('calls.artifact.messages', {
                  count: call.summary.messages,
                }),
                call.summary.messages,
              )}
              {renderDetailStat(
                t('calls.artifact.proposals', {
                  count: call.summary.proposals,
                }),
                call.summary.proposals,
              )}
              {renderDetailStat(
                t('calls.artifact.polls', { count: call.summary.polls }),
                call.summary.polls,
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-medium">
                  {t('calls.artifact.participants')}
                </h4>
                <div className="space-y-2">
                  {call.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <CallUserAvatar user={participant} />
                      <span className="truncate text-sm">
                        {displayName(participant)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
            <div className="min-h-0 min-w-0 md:min-h-105">
              <CallChatPanel
                initialFeedLimit={messageCount + decisionCount}
                serverId={serverId}
                channel={channel}
                callId={call.id}
                readOnly
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
