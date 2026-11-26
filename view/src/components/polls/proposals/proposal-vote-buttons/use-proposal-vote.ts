import { api } from '@/client/api-client';
import {
  getActiveDecisionsQueryKey,
  updateActiveDecisionCache,
} from '@/components/decisions/decisions-panel.utils';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { type FeedQuery } from '@/types/channel.types';
import { type PollClosedReason, type PollRes } from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface VoteResult {
  action: 'create' | 'update' | 'delete';
  voteId: string;
  voteType?: VoteType;
  previousVoteType?: VoteType;
  isRatifyingVote: boolean;
  closedReason?: PollClosedReason;
}

interface Options {
  channelId: string;
  pollId: string;
  myVote?: VoteRes;
  feedQueryKey?: QueryKey;
  onVoteSuccess?: () => void;
  onRatifyingVote?: () => void;
  onVoteCounted?: () => void;
  onRollback: (failedVoteType: VoteType | null) => void;
  updateCachedProposal?: (update: (proposal: PollRes) => PollRes) => void;
}

export const useProposalVote = ({
  channelId,
  pollId,
  myVote,
  feedQueryKey,
  onVoteSuccess,
  onRatifyingVote,
  onVoteCounted,
  onRollback,
  updateCachedProposal,
}: Options) => {
  const { serverId } = useServerData();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const sendVote = async (voteType: VoteType | null): Promise<VoteResult> => {
    if (!serverId) {
      throw new Error('Server ID is required');
    }
    if (!myVote) {
      if (!voteType) {
        throw new Error('Vote type is required');
      }
      const { vote } = await api.createVote(serverId, channelId, pollId, {
        voteType,
      });
      return {
        action: 'create',
        voteId: vote.id,
        voteType,
        isRatifyingVote: vote.isRatifyingVote,
        closedReason: vote.closedReason,
      };
    }
    if (!voteType) {
      await api.deleteVote(serverId, channelId, pollId, myVote.id);
      return {
        action: 'delete',
        voteId: myVote.id,
        previousVoteType: myVote.voteType,
        isRatifyingVote: false,
      };
    }
    const { isRatifyingVote, closedReason } = await api.updateVote(
      serverId,
      channelId,
      pollId,
      myVote.id,
      { voteType },
    );
    return {
      action: 'update',
      voteId: myVote.id,
      voteType,
      previousVoteType: myVote.voteType,
      isRatifyingVote,
      closedReason,
    };
  };

  const applyVoteResult = (result: VoteResult) => {
    if (!serverId) {
      return;
    }
    const wasAgree = result.previousVoteType === 'agree';
    const isAgree = result.voteType === 'agree';

    const updateProposal = (proposal: PollRes): PollRes => {
      const agreementVoteCount =
        proposal.agreementVoteCount + Number(isAgree) - Number(wasAgree);
      let votes: VoteRes[] = proposal.votes ? [...proposal.votes] : [];

      if (result.action === 'delete') {
        votes = votes.filter((vote) => vote.id !== result.voteId);
        return {
          ...proposal,
          votes,
          agreementVoteCount,
          myVote: undefined,
        };
      }
      if (result.action === 'create') {
        votes.push({ id: result.voteId, voteType: result.voteType });
      }
      if (result.action === 'update') {
        votes = votes.map((vote) =>
          vote.id === result.voteId
            ? { ...vote, voteType: result.voteType }
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
        myVote: { id: result.voteId, voteType: result.voteType },
      };
    };

    if (feedQueryKey) {
      queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
        if (!oldData) {
          return oldData;
        }
        const pages = oldData.pages.map((page) => ({
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
        }));
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
          result.action === 'create' ? 1 : result.action === 'delete' ? -1 : 0;
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

    if (result.isRatifyingVote && !result.closedReason) {
      onRatifyingVote?.();
    }
  };

  const { mutate, isPending, variables } = useMutation({
    mutationFn: sendVote,
    onSuccess: (result) => {
      applyVoteResult(result);
      if (result.action !== 'delete') {
        onVoteCounted?.();
      }
      onVoteSuccess?.();
    },
    onError: (error, voteType) => {
      onRollback(voteType);
      handleError(error);
    },
  });

  const displayedVoteType = isPending
    ? (variables ?? null)
    : (myVote?.voteType ?? null);

  return { displayedVoteType, isPending, castVote: mutate };
};
