import { api } from '@/client/api-client';
import { CreatePollForm } from '@/components/polls/create-poll-form';
import { InlinePoll } from '@/components/polls/inline-poll';
import { CreateProposalForm } from '@/components/polls/proposals/create-proposal-form/create-proposal-form';
import { InlineProposal } from '@/components/polls/proposals/inline-proposal/inline-proposal';
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
import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useSubscription } from '@/hooks/use-subscription';
import { channelPubSubTopic } from '@/lib/pub-sub.utils';
import { type ChannelRes, type FeedQuery } from '@/types/channel.types';
import { type PollRes } from '@/types/poll.types';
import { type PubSubMessage } from '@/types/shared.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuListTodo } from 'react-icons/lu';
import { MdClose } from 'react-icons/md';
import { MdPoll } from 'react-icons/md';
import { responseCount } from './call-decision-utils';

interface NewPollPayload {
  type: PubSubMessageType.POLL;
  poll: PollRes;
}

interface Props {
  serverId?: string;
  channel: ChannelRes;
  callId: string;
  onClose?: () => void;
}

export const CallDecisionPanel = ({
  serverId,
  channel,
  callId,
  onClose,
}: Props) => {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const proposalFormDialogContentRef = useRef<HTMLDivElement>(null);

  const { me } = useAuthData();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const decisionQueryKey = useMemo(
    () => [
      'servers',
      serverId,
      'channels',
      channel.id,
      'calls',
      callId,
      'decisions',
    ],
    [callId, channel.id, serverId],
  );
  const decisionFeedQueryKey = useMemo(
    () => [
      'servers',
      serverId,
      'channels',
      channel.id,
      'calls',
      callId,
      'decisions',
      'feed-cache',
    ],
    [callId, channel.id, serverId],
  );
  const channelFeedQueryKey = useMemo(
    () => ['servers', serverId, 'channels', channel.id, 'feed'],
    [channel.id, serverId],
  );

  const { data: decision } = useQuery({
    queryKey: decisionQueryKey,
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getCallDecision(serverId, channel.id, callId);
    },
    enabled: !!serverId,
  });

  const displayedDecision = decision?.activeItem || decision?.recentResult;

  const sourceCallContext =
    displayedDecision?.sourceCallId === callId ? 'this-call' : 'another-call';

  const isShowingRecentResult =
    !!decision?.recentResult && !decision?.activeItem;

  const displayedFeedQueryKey = decision?.activeItem
    ? decisionFeedQueryKey
    : channelFeedQueryKey;

  useEffect(() => {
    if (!decision?.activeItem) {
      return;
    }
    queryClient.setQueryData<FeedQuery>(decisionFeedQueryKey, {
      pages: [{ feed: [{ ...decision.activeItem, type: 'poll' }] }],
      pageParams: [null],
    });
  }, [decision?.activeItem, decisionFeedQueryKey, queryClient]);

  const refreshDecision = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: decisionQueryKey });
    void queryClient.invalidateQueries({ queryKey: channelFeedQueryKey });
  }, [channelFeedQueryKey, decisionQueryKey, queryClient]);

  useSubscription(
    channelPubSubTopic('new-poll', serverId, channel.id, me?.id),
    {
      onMessage: (event) => {
        const { body }: PubSubMessage<NewPollPayload> = JSON.parse(event.data);
        if (body?.type === PubSubMessageType.POLL) {
          refreshDecision();
        }
      },
      enabled: !!me && !!serverId,
    },
  );

  const statusText = useMemo(() => {
    if (!displayedDecision) {
      return t('calls.decisions.noActiveDescription');
    }
    if (isShowingRecentResult) {
      return t('calls.decisions.recentResultDescription');
    }
    return responseCount(displayedDecision);
  }, [displayedDecision, isShowingRecentResult, t]);

  return (
    <section
      aria-label={t('calls.headers.activeDecision')}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="border-b border-[--color-border] px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">
            {t('calls.headers.activeDecision')}
          </h2>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hidden size-7 md:inline-flex"
              aria-label={t('calls.labels.closeActiveDecision')}
              onClick={onClose}
            >
              <MdClose />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">{statusText}</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {displayedDecision ? (
          <div className="[&>article]:gap-3 [&>article]:pt-0 [&>article>button]:hidden">
            {displayedDecision.pollType === 'proposal' ? (
              <InlineProposal
                channel={channel}
                feedQueryKey={displayedFeedQueryKey}
                onPollChange={refreshDecision}
                poll={displayedDecision}
                sourceCallContext={sourceCallContext}
                me={me}
              />
            ) : (
              <InlinePoll
                channel={channel}
                feedQueryKey={displayedFeedQueryKey}
                onPollChange={refreshDecision}
                poll={displayedDecision}
                me={me}
              />
            )}
          </div>
        ) : (
          <Card className="gap-3 rounded-lg px-4 py-4">
            <div>
              <h3 className="text-sm font-semibold">
                {t('calls.decisions.noActiveTitle')}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('calls.decisions.noActiveDescription')}
              </p>
            </div>
          </Card>
        )}
      </div>

      <Separator />

      <div className="grid gap-2 p-3">
        <Button onClick={() => setShowProposalForm(true)}>
          <LuListTodo />
          {t('proposals.actions.create')}
        </Button>
        <Button variant="secondary" onClick={() => setShowPollForm(true)}>
          <MdPoll />
          {t('polls.actions.createPoll')}
        </Button>
      </div>

      <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
        <DialogContent
          className="overflow-y-auto md:max-h-[90vh] md:w-xl"
          ref={proposalFormDialogContentRef}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl leading-tight font-medium">
              {t('proposals.headers.create')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center md:text-left">
            {t('proposals.descriptions.create')}
          </DialogDescription>

          <Separator className="mt-1" />

          <CreateProposalForm
            channelId={channel.id}
            callId={callId}
            onSuccess={() => {
              setShowProposalForm(false);
              refreshDecision();
            }}
            onNavigate={() => {
              proposalFormDialogContentRef.current?.scrollTo({
                top: 0,
              });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPollForm} onOpenChange={setShowPollForm}>
        <DialogContent className="overflow-y-auto md:max-h-[90vh] md:w-xl">
          <DialogHeader className="pb-3.5">
            <DialogTitle>{t('polls.headers.create')}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            {t('polls.descriptions.create')}
          </DialogDescription>

          <CreatePollForm
            channelId={channel.id}
            callId={callId}
            onSuccess={() => {
              setShowPollForm(false);
              refreshDecision();
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};
