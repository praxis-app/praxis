import { ProposalVoteButton } from '@/components/polls/proposals/proposal-vote-buttons/proposal-vote-button';
import { useProposalVote } from '@/components/polls/proposals/proposal-vote-buttons/use-proposal-vote';
import {
  type VoteAnimations,
  type VoteMotion,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import {
  ProposalVoteConfirmationDialog,
  type ProposalVoteConfirmationType,
} from '@/components/polls/proposals/proposal-vote-confirmation-dialog';
import { VOTE_TYPES } from '@/constants/vote.constants';
import { useAbility } from '@/hooks/use-ability';
import { useAuthData } from '@/hooks/use-auth-data';
import { useVotingDeadline } from '@/hooks/use-voting-deadline';
import { wouldVoteRatifyProposal } from '@/lib/poll.utils';
import { type ChannelRes } from '@/types/channel.types';
import {
  type DecisionMakingModel,
  type PollConfigRes,
  type PollRes,
  type PollStage,
} from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';
import { type QueryKey } from '@tanstack/react-query';
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
  onRatifyingVote?: () => void;
  onVoteCounted?: () => void;
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
  onRatifyingVote,
  onVoteCounted,
  updateCachedProposal,
}: Props) => {
  const [pendingVote, setPendingVote] = useState<{
    voteType: VoteType;
    confirmationType: ProposalVoteConfirmationType;
  } | null>(null);
  const [voteAnimations, setVoteAnimations] = useState<VoteAnimations>({});

  const deadlineHasPassed = useVotingDeadline(closingAt);

  const { isLoggedIn } = useAuthData();
  const { serverAbility } = useAbility();
  const { t } = useTranslation();

  const playVoteMotion = (voteType: VoteType, motion: VoteMotion) => {
    setVoteAnimations((prev) => {
      const next: VoteAnimations = {};
      for (const [type, animation] of Object.entries(prev)) {
        next[type as VoteType] = { ...animation, motion: null };
      }
      const nonce = prev[voteType]?.nonce ?? 0;
      next[voteType] = {
        nonce: motion === 'retract' ? nonce : nonce + 1,
        motion,
      };
      return next;
    });
  };

  const { displayedVoteType, castVote } = useProposalVote({
    channelId: channel.id,
    pollId,
    myVote,
    feedQueryKey,
    onVoteSuccess,
    onRatifyingVote,
    onVoteCounted,
    updateCachedProposal,
    onRollback: (failedVoteType) => {
      const rolledBackVoteType = failedVoteType ?? myVote?.voteType;
      if (rolledBackVoteType) {
        playVoteMotion(rolledBackVoteType, 'rollback');
      }
    },
  });

  const blockingRestricted =
    config.blocksOpenToAll === false &&
    !serverAbility.can('create', 'ProposalBlock');

  const voteTypes = VOTE_TYPES.filter((voteType) => {
    if (voteType !== 'block') {
      return true;
    }
    return decisionMakingModel !== 'majority-vote' && !blockingRestricted;
  });

  const applyVote = (voteType: VoteType) => {
    const isRetracting = displayedVoteType === voteType;
    playVoteMotion(voteType, isRetracting ? 'retract' : 'select');
    castVote(isRetracting ? null : voteType);
  };

  const handleVoteBtnClick = (voteType: VoteType) => {
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
    if (displayedVoteType !== voteType) {
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
    applyVote(voteType);
  };

  const confirmPendingVote = () => {
    if (!pendingVote) {
      return;
    }
    applyVote(pendingVote.voteType);
    setPendingVote(null);
  };

  const isVotingDisabled = disabled || stage !== 'voting' || deadlineHasPassed;

  return (
    <>
      <div className="grid w-full min-w-0 grid-cols-2 gap-2 @lg:grid-cols-4">
        {voteTypes.map((vote) => (
          <ProposalVoteButton
            key={vote}
            voteType={vote}
            isSelected={displayedVoteType === vote}
            isDisabled={isVotingDisabled}
            animation={voteAnimations[vote]}
            onClick={() => handleVoteBtnClick(vote)}
          />
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
