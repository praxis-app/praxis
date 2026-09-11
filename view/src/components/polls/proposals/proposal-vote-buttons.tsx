import { api } from '@/client/api-client';
import {
  getActiveDecisionsQueryKey,
  updateActiveDecisionCache,
} from '@/components/decisions/decisions-panel.utils';
import {
  ProposalVoteConfirmationDialog,
  type ProposalVoteConfirmationType,
} from '@/components/polls/proposals/proposal-vote-confirmation-dialog';
import { Button } from '@/components/ui/button';
import { VOTE_TYPES } from '@/constants/vote.constants';
import { useAbility } from '@/hooks/use-ability';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { useVotingDeadline } from '@/hooks/use-voting-deadline';
import { handleError } from '@/lib/error.utils';
import { wouldVoteRatifyProposal } from '@/lib/poll.utils';
import { cn } from '@/lib/shared.utils';
import { type ChannelRes, type FeedQuery } from '@/types/channel.types';
import {
  type DecisionMakingModel,
  type PollConfigRes,
  type PollRes,
  type PollStage,
} from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
  channel: ChannelRes;
  feedQueryKey?: QueryKey;
  myVote?: VoteRes;
  pollId: string;
  stage: PollStage;
  decisionMakingModel: DecisionMakingModel;
  config: PollConfigRes;
  votes: VoteRes[];
  memberCount: number;
  closingAt?: string;
  disabled?: boolean;
  disabledReason?: string;
  onVoteSuccess?: () => void;
  updateCachedProposal?: (update: (proposal: PollRes) => PollRes) => void;
}

export const ProposalVoteButtons = ({
  channel,
  feedQueryKey,
  pollId,
  myVote,
  stage,
  decisionMakingModel,
  config,
  votes,
  memberCount,
  closingAt,
  disabled = false,
  disabledReason,
  onVoteSuccess,
  updateCachedProposal,
}: Props) => {
  const [pendingVote, setPendingVote] = useState<{
    voteType: VoteType;
    confirmationType: ProposalVoteConfirmationType;
  } | null>(null);

  const deadlineHasPassed = useVotingDeadline(closingAt);

  const { serverId } = useServerData();
  const { isLoggedIn } = useAuthData();
  const { serverAbility } = useAbility();

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const blockingRestricted =
    config.blocksOpenToAll === false &&
    !serverAbility.can('create', 'ProposalBlock');

  const voteTypes = VOTE_TYPES.filter((voteType) => {
    if (voteType !== 'block') {
      return true;
    }
    return decisionMakingModel !== 'majority-vote' && !blockingRestricted;
  });

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      // Create vote
      if (!myVote) {
        const { vote } = await api.createVote(serverId, channel.id, pollId, {
          voteType,
        });
        return {
          action: 'create' as const,
          isRatifyingVote: vote.isRatifyingVote,
          closedReason: vote.closedReason,
          voteId: vote.id,
          voteType,
        };
      }
      // Delete vote
      if (myVote.voteType === voteType) {
        await api.deleteVote(serverId, channel.id, pollId, myVote.id);
        return {
          action: 'delete' as const,
          isRatifyingVote: false,
          voteId: myVote.id,
        };
      }
      // Update vote
      const { isRatifyingVote, closedReason } = await api.updateVote(
        serverId,
        channel.id,
        pollId,
        myVote.id,
        { voteType },
      );
      return {
        action: 'update' as const,
        isRatifyingVote,
        closedReason,
        voteId: myVote.id,
        voteType,
      };
    },
    onSuccess: (result) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const updateProposal = (proposal: PollRes): PollRes => {
        let agreementVoteCount = proposal.agreementVoteCount;
        let votes: VoteRes[] = proposal.votes ? [...proposal.votes] : [];

        if (result.action === 'delete') {
          if (myVote?.voteType === 'agree') {
            agreementVoteCount -= 1;
          }
          votes = votes.filter((vote) => vote.id !== result.voteId);
          return {
            ...proposal,
            votes,
            agreementVoteCount,
            myVote: undefined,
          };
        }

        if (result.action === 'create') {
          if (result.voteType === 'agree') {
            agreementVoteCount += 1;
          }
          votes.push({ id: result.voteId, voteType: result.voteType! });
        }

        if (result.action === 'update') {
          if (myVote?.voteType !== 'agree' && result.voteType === 'agree') {
            agreementVoteCount += 1;
          }
          if (myVote?.voteType === 'agree' && result.voteType !== 'agree') {
            agreementVoteCount -= 1;
          }
          votes = votes.map((vote) =>
            vote.id === result.voteId
              ? { ...vote, voteType: result.voteType! }
              : vote,
          );
        }

        return {
          ...proposal,
          votes,
          agreementVoteCount,
          stage: result.isRatifyingVote ? 'ratified' : proposal.stage,
          ...(result.closedReason
            ? { stage: 'closed', closedReason: result.closedReason }
            : {}),
          myVote: { id: result.voteId, voteType: result.voteType! },
        };
      };

      if (feedQueryKey) {
        queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
          if (!oldData) {
            return oldData;
          }
          const pages = oldData.pages.map((page) => {
            return {
              ...page,
              feed: page.feed.map((item) => {
                if (
                  item.id !== pollId ||
                  item.type !== 'poll' ||
                  item.pollType !== 'proposal'
                ) {
                  return item;
                }
                return { ...updateProposal(item), type: 'poll' as const };
              }),
            };
          });
          return { pages, pageParams: oldData.pageParams };
        });
      }

      if (result.isRatifyingVote || result.closedReason) {
        if (feedQueryKey) {
          void queryClient.invalidateQueries({ queryKey: feedQueryKey });
        }
        void queryClient.invalidateQueries({
          queryKey: getActiveDecisionsQueryKey(serverId),
        });
        toast(
          t(
            result.closedReason === 'event-host-ineligible'
              ? 'proposals.outcomes.eventHostIneligible'
              : result.closedReason === 'event-start-elapsed'
                ? 'proposals.outcomes.eventStartElapsed'
                : 'proposals.prompts.ratifiedSuccess',
          ),
        );
      } else {
        updateActiveDecisionCache(queryClient, serverId, pollId, (decision) => {
          const responseCountChange =
            result.action === 'create'
              ? 1
              : result.action === 'delete'
                ? -1
                : 0;
          return {
            ...decision,
            responseCount: Math.max(
              0,
              decision.responseCount + responseCountChange,
            ),
            hasResponded: result.action !== 'delete',
          };
        });
      }
      updateCachedProposal?.(updateProposal);

      onVoteSuccess?.();
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const handleVoteBtnClick = (voteType: VoteType) => {
    if (isPending) {
      return;
    }
    if (!isLoggedIn) {
      toast(t('proposals.prompts.signInToVote'));
      return;
    }
    if (stage === 'closed') {
      toast(t('proposals.prompts.noVotingAfterClose'));
      return;
    }
    if (stage === 'ratified') {
      toast(t('proposals.prompts.noVotingAfterRatification'));
      return;
    }
    if (deadlineHasPassed) {
      toast(t('proposals.prompts.noVotingAfterDeadline'));
      return;
    }
    if (stage === 'revision') {
      toast(t('proposals.prompts.noVotingDuringRevision'));
      return;
    }
    if (disabled) {
      toast(disabledReason ?? t('proposals.prompts.votingUnavailable'));
      return;
    }
    if (myVote?.voteType !== voteType) {
      const confirmationType =
        voteType === 'block'
          ? 'blocking'
          : wouldVoteRatifyProposal(
              votes,
              config,
              memberCount,
              myVote,
              voteType,
            )
            ? 'ratifying'
            : null;
      if (confirmationType) {
        setPendingVote({ voteType, confirmationType });
        return;
      }
    }
    castVote(voteType);
  };

  const confirmPendingVote = () => {
    if (!pendingVote) {
      return;
    }
    castVote(pendingVote.voteType);
    setPendingVote(null);
  };

  const isVotingDisabled =
    disabled || isPending || stage !== 'voting' || deadlineHasPassed;

  return (
    <>
      <div className="grid w-full min-w-0 grid-cols-2 gap-2 @lg:grid-cols-4">
        {voteTypes.map((vote) => (
          <Button
            key={vote}
            variant="outline"
            size="sm"
            className={cn(
              'col-span-1',
              myVote?.voteType === vote && 'bg-primary/15!',
              isVotingDisabled &&
                'hover:bg-background dark:hover:bg-input/30 opacity-50',
            )}
            onClick={() => handleVoteBtnClick(vote)}
            aria-disabled={isVotingDisabled}
            disabled={isPending}
          >
            {t(`proposals.actions.${vote}`)}
          </Button>
        ))}
      </div>
      <ProposalVoteConfirmationDialog
        confirmationType={pendingVote?.confirmationType ?? null}
        onCancel={() => setPendingVote(null)}
        onConfirm={confirmPendingVote}
      />
    </>
  );
};
