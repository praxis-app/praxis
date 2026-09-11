import { getProposalRuleStatus } from '@/lib/poll.utils';
import { type PollConfigRes } from '@/types/poll.types';
import { type VoteRes } from '@/types/vote.types';
import { describe, expect, it } from 'vitest';

const consensusConfig: PollConfigRes = {
  decisionMakingModel: 'consensus',
  agreementThreshold: 51,
  quorumEnabled: false,
  quorumThreshold: 50,
  disagreementsLimit: 2,
  abstainsLimit: 2,
  blocksOpenToAll: false,
};

const vote = (
  id: string,
  voteType: VoteRes['voteType'],
  blockIgnored = false,
): VoteRes => ({ id, voteType, ...(blockIgnored ? { blockIgnored } : {}) });

describe('getProposalRuleStatus', () => {
  it('should report approval among Agree and Disagree votes', () => {
    const status = getProposalRuleStatus(
      [vote('1', 'agree'), vote('2', 'disagree'), vote('3', 'abstain')],
      consensusConfig,
      7,
    );

    expect(status.approvalVoteCount).toBe(2);
    expect(status.approvalPercentage).toBe(50);
    expect(status.agreementMet).toBe(false);
  });

  it('should not round approval up to a passing whole percentage', () => {
    const status = getProposalRuleStatus(
      [vote('1', 'agree'), vote('2', 'agree'), vote('3', 'disagree')],
      { ...consensusConfig, agreementThreshold: 67 },
      3,
    );

    expect(status.approvalPercentage).toBe(66.7);
    expect(status.agreementMet).toBe(false);
  });

  it('should let an eligible block prevent the proposal from passing', () => {
    const status = getProposalRuleStatus(
      [vote('1', 'agree'), vote('2', 'block')],
      consensusConfig,
      2,
    );

    expect(status.blocks).toBe(1);
    expect(status.ignoredBlocks).toBe(0);
    expect(status.blocksMet).toBe(false);
    expect(status.passes).toBe(false);
  });

  it('should ignore a block whose voter lost the permission', () => {
    const status = getProposalRuleStatus(
      [vote('1', 'agree'), vote('2', 'block', true)],
      consensusConfig,
      2,
    );

    expect(status.blocks).toBe(0);
    expect(status.ignoredBlocks).toBe(1);
    expect(status.blocksMet).toBe(true);
    expect(status.passes).toBe(true);
  });

  it('should drop an ignored block from quorum, matching the server', () => {
    const votes = [vote('1', 'agree'), vote('2', 'block', true)];
    const config: PollConfigRes = {
      ...consensusConfig,
      quorumEnabled: true,
      quorumThreshold: 50,
    };

    const status = getProposalRuleStatus(votes, config, 4);

    expect(status.totalVotes).toBe(1);
    expect(status.requiredQuorum).toBe(2);
    expect(status.quorumMet).toBe(false);
    expect(status.passes).toBe(false);
  });

  it('should keep counting an eligible block under consent', () => {
    const config: PollConfigRes = {
      ...consensusConfig,
      decisionMakingModel: 'consent',
      closingAt: new Date(1_000).toISOString(),
    };

    const blocked = getProposalRuleStatus(
      [vote('1', 'block')],
      config,
      2,
      2_000,
    );
    const ignored = getProposalRuleStatus(
      [vote('1', 'block', true)],
      config,
      2,
      2_000,
    );

    expect(blocked.eligible).toBe(false);
    expect(ignored.eligible).toBe(true);
    expect(ignored.ignoredBlocks).toBe(1);
  });

  it('should not report ignored blocks when blocking is open to all', () => {
    const status = getProposalRuleStatus(
      [vote('1', 'agree'), vote('2', 'block')],
      { ...consensusConfig, blocksOpenToAll: true },
      2,
    );

    expect(status.ignoredBlocks).toBe(0);
    expect(status.blocks).toBe(1);
    expect(status.passes).toBe(false);
  });
});
