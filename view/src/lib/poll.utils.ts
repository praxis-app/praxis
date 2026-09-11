import { VotingTimeLimit } from '@/constants/vote.constants';
import { t } from '@/lib/shared.utils';
import { sortConsensusVotesByType, type WithVoteType } from '@/lib/vote.utils';
import { type PollConfigRes } from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';

/**
 * Calculate progress percentage toward a required voting threshold
 * @param current Current count
 * @param required Required count to meet threshold
 */
export const getProgressPercentage = (
  current: number,
  required: number,
): number =>
  required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 100;

/**
 * Calculate the required count to meet a given threshold in voting
 * @param memberCount Total eligible voters
 * @param threshold Percentage threshold (e.g., 51 for 51%)
 */
export const getRequiredCount = (
  memberCount: number,
  threshold: number,
): number => {
  return Math.ceil(memberCount * (threshold * 0.01));
};

export interface ProposalRuleStatus {
  totalVotes: number;
  agreements: number;
  disagreements: number;
  abstains: number;
  blocks: number;
  ignoredBlocks: number;
  approvalVoteCount: number;
  approvalPercentage: number;
  requiredQuorum: number;
  agreementApplies: boolean;
  quorumApplies: boolean;
  limitsApply: boolean;
  agreementMet: boolean;
  quorumMet: boolean;
  disagreementsMet: boolean;
  abstainsMet: boolean;
  blocksMet: boolean;
  deadlineRequired: boolean;
  deadlineReached: boolean;
  passes: boolean;
  eligible: boolean;
}

/** Ignored blocks leave the arithmetic entirely, quorum included */
export const getCountedVotes = (votes: VoteRes[]) =>
  votes.filter((vote) => !vote.blockIgnored);

export const getIgnoredBlocks = (votes: VoteRes[]) =>
  votes.filter((vote) => vote.blockIgnored);

/**
 * Mirror of the server's decision-model evaluation. Rules that do not apply to
 * the proposal's model are reported as met so they can never be shown as a
 * blocker, and `eligible` matches what the server would ratify at `now`
 */
export const getProposalRuleStatus = (
  votes: VoteRes[],
  config: PollConfigRes,
  memberCount: number,
  now = Date.now(),
): ProposalRuleStatus => {
  const typedVotes = getCountedVotes(votes).filter(
    (vote): vote is VoteRes & WithVoteType => !!vote.voteType,
  );
  const { agreements, disagreements, abstains, blocks } =
    sortConsensusVotesByType(typedVotes);
  const approvalVoteCount = agreements.length + disagreements.length;
  const approvalPercentage =
    approvalVoteCount > 0
      ? Math.round((agreements.length / approvalVoteCount) * 1000) / 10
      : 0;
  const requiredAgreements = getRequiredCount(
    approvalVoteCount,
    config.agreementThreshold ?? 0,
  );
  const requiredQuorum = getRequiredCount(
    memberCount,
    config.quorumThreshold ?? 0,
  );

  const isConsent = config.decisionMakingModel === 'consent';
  const isMajorityVote = config.decisionMakingModel === 'majority-vote';
  const agreementApplies = !isConsent;
  const quorumApplies = !isConsent && !!config.quorumEnabled;
  const limitsApply = !isMajorityVote;

  const agreementMet =
    !agreementApplies ||
    (approvalVoteCount > 0 && agreements.length >= requiredAgreements);
  const quorumMet = !quorumApplies || typedVotes.length >= requiredQuorum;
  const disagreementsMet =
    !limitsApply || disagreements.length <= (config.disagreementsLimit ?? 0);
  const abstainsMet =
    !limitsApply || abstains.length <= (config.abstainsLimit ?? 0);
  const blocksMet = !limitsApply || blocks.length === 0;
  const passes =
    agreementMet && quorumMet && disagreementsMet && abstainsMet && blocksMet;

  // Consent only evaluates at a finite deadline; the other models evaluate
  // immediately when they have none
  const closingAt = config.closingAt
    ? new Date(config.closingAt).getTime()
    : null;
  const deadlineReached = closingAt === null ? !isConsent : now >= closingAt;

  return {
    totalVotes: typedVotes.length,
    agreements: agreements.length,
    disagreements: disagreements.length,
    abstains: abstains.length,
    blocks: blocks.length,
    ignoredBlocks: getIgnoredBlocks(votes).length,
    approvalVoteCount,
    approvalPercentage,
    requiredQuorum,
    agreementApplies,
    quorumApplies,
    limitsApply,
    agreementMet,
    quorumMet,
    disagreementsMet,
    abstainsMet,
    blocksMet,
    deadlineRequired: isConsent,
    deadlineReached,
    passes,
    eligible: deadlineReached && passes,
  };
};

export const wouldVoteRatifyProposal = (
  votes: VoteRes[],
  config: PollConfigRes,
  memberCount: number,
  myVote: VoteRes | undefined,
  voteType: VoteType,
) => {
  const prospectiveVote = {
    id: myVote?.id ?? 'prospective-vote',
    voteType,
  };
  const prospectiveVotes = myVote
    ? [...votes.filter((vote) => vote.id !== myVote.id), prospectiveVote]
    : [...votes, prospectiveVote];

  return getProposalRuleStatus(prospectiveVotes, config, memberCount).eligible;
};

/** Render a voting time limit, stored in minutes, as readable copy */
export const formatVotingTimeLimit = (minutes: number) => {
  if (minutes === VotingTimeLimit.Unlimited) {
    return t('time.unlimited');
  }
  if (minutes % VotingTimeLimit.OneWeek === 0) {
    const weeks = minutes / VotingTimeLimit.OneWeek;
    return t('time.weeks', { count: weeks });
  }
  if (minutes % VotingTimeLimit.OneDay === 0) {
    const days = minutes / VotingTimeLimit.OneDay;
    return t('time.daysFull', { count: days });
  }
  if (minutes % VotingTimeLimit.OneHour === 0) {
    const hours = minutes / VotingTimeLimit.OneHour;
    return t('time.hoursFull', { count: hours });
  }
  return t('time.minutesFull', { count: minutes });
};
