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
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useRef, useState } from 'react';
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
  const [optimisticVoteType, setOptimisticVoteType] = useState<
    VoteType | null | undefined
  >();

  const confirmedVoteRef = useRef<VoteRes | undefined>(undefined);
  const targetVoteTypeRef = useRef<VoteType | null>(null);
  const isSyncingRef = useRef(false);
  const didCancelRefetchRef = useRef(false);

  const { serverId } = useServerData();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const displayedVoteType =
    optimisticVoteType === undefined
      ? (myVote?.voteType ?? null)
      : optimisticVoteType;

  // TODO: Confirm this fixes a saved vote briefly losing its selected state. It
  // happened once in the app and couldn't be reproduced
  const cancelFeedRefetch = async () => {
    if (!feedQueryKey || !queryClient.isFetching({ queryKey: feedQueryKey })) {
      return;
    }
    didCancelRefetchRef.current = true;
    await queryClient.cancelQueries({ queryKey: feedQueryKey });
  };

  const sendVote = async (
    base: VoteRes | undefined,
    voteType: VoteType | null,
  ): Promise<VoteResult> => {
    if (!serverId) {
      throw new Error('Server ID is required');
    }
    if (!base) {
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
      await api.deleteVote(serverId, channelId, pollId, base.id);
      return {
        action: 'delete',
        voteId: base.id,
        previousVoteType: base.voteType,
        isRatifyingVote: false,
      };
    }
    const { isRatifyingVote, closedReason } = await api.updateVote(
      serverId,
      channelId,
      pollId,
      base.id,
      { voteType },
    );
    return {
      action: 'update',
      voteId: base.id,
      voteType,
      previousVoteType: base.voteType,
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

  const syncVote = async () => {
    try {
      while (
        targetVoteTypeRef.current !==
        (confirmedVoteRef.current?.voteType ?? null)
      ) {
        const result = await sendVote(
          confirmedVoteRef.current,
          targetVoteTypeRef.current,
        );
        await cancelFeedRefetch();
        confirmedVoteRef.current =
          result.action === 'delete'
            ? undefined
            : { id: result.voteId, voteType: result.voteType };
        applyVoteResult(result);

        if (result.isRatifyingVote || result.closedReason) {
          targetVoteTypeRef.current = result.voteType ?? null;
        }
      }
      setOptimisticVoteType(undefined);
      if (didCancelRefetchRef.current && feedQueryKey) {
        void queryClient.invalidateQueries({ queryKey: feedQueryKey });
      }
      if (confirmedVoteRef.current) {
        onVoteCounted?.();
      }
      onVoteSuccess?.();
    } catch (error) {
      const failedVoteType = targetVoteTypeRef.current;
      targetVoteTypeRef.current = confirmedVoteRef.current?.voteType ?? null;
      setOptimisticVoteType(undefined);
      onRollback(failedVoteType);
      handleError(error as Error);
    } finally {
      isSyncingRef.current = false;
      didCancelRefetchRef.current = false;
    }
  };

  const castVote = (voteType: VoteType | null) => {
    targetVoteTypeRef.current = voteType;
    setOptimisticVoteType(voteType);

    if (isSyncingRef.current) {
      return;
    }
    confirmedVoteRef.current = myVote;
    isSyncingRef.current = true;
    void cancelFeedRefetch().then(syncVote);
  };

  return { displayedVoteType, castVote };
};
