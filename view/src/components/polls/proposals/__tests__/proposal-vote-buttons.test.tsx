import { ProposalVoteButtons } from '@/components/polls/proposals/proposal-vote-buttons/proposal-vote-buttons';
import {
  VOTE_EASINGS,
  VOTE_GLYPHS,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type ChannelRes } from '@/types/channel.types';
import {
  type DecisionMakingModel,
  type PollConfigRes,
  type PollRes,
} from '@/types/poll.types';
import { type VoteRes, type VoteType } from '@/types/vote.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { canMock, handleErrorMock, apiMock } = vi.hoisted(() => ({
  canMock: vi.fn(),
  handleErrorMock: vi.fn(),
  apiMock: {
    createVote: vi.fn(),
    updateVote: vi.fn(),
    deleteVote: vi.fn(),
  },
}));

vi.mock('@/client/api-client', () => ({ api: apiMock }));
vi.mock('@/lib/error.utils', () => ({ handleError: handleErrorMock }));
vi.mock('@/hooks/use-ability', () => ({
  useAbility: () => ({ serverAbility: { can: canMock } }),
}));
vi.mock('@/hooks/use-auth-data', () => ({
  useAuthData: () => ({ isLoggedIn: true }),
}));
vi.mock('@/hooks/use-server-data', () => ({
  useServerData: () => ({ serverId: 'server-1' }),
}));
vi.mock('@/hooks/use-voting-deadline', () => ({
  useVotingDeadline: () => false,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const channel = { id: 'channel-1' } as ChannelRes;

const StatefulButtons = ({
  config,
  decisionMakingModel,
  initialVote,
}: {
  config: PollConfigRes;
  decisionMakingModel: DecisionMakingModel;
  initialVote?: VoteRes;
}) => {
  const [proposal, setProposal] = useState({
    myVote: initialVote,
    votes: initialVote ? [initialVote] : [],
    agreementVoteCount: 0,
    stage: 'voting',
  } as PollRes);

  return (
    <ProposalVoteButtons
      channel={channel}
      pollId="poll-1"
      myVote={proposal.myVote}
      stage={proposal.stage}
      decisionMakingModel={decisionMakingModel}
      config={config}
      votes={proposal.votes ?? []}
      memberCount={10}
      updateCachedProposal={(update) => setProposal(update)}
    />
  );
};

const renderButtons = ({
  blocksOpenToAll,
  canBlock,
  decisionMakingModel = 'consensus',
  myVote,
}: {
  blocksOpenToAll?: boolean;
  canBlock: boolean;
  decisionMakingModel?: DecisionMakingModel;
  myVote?: VoteRes;
}) => {
  canMock.mockImplementation(
    (action: string, subject: string) =>
      canBlock && action === 'create' && subject === 'ProposalBlock',
  );

  const config: PollConfigRes = {
    decisionMakingModel,
    blocksOpenToAll,
    quorumEnabled: true,
    quorumThreshold: 100,
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <StatefulButtons
        config={config}
        decisionMakingModel={decisionMakingModel}
        initialVote={myVote}
      />
    </QueryClientProvider>,
  );
};

const getVoteButton = (voteType: VoteType) =>
  screen.getByRole('button', { name: `proposals.actions.${voteType}` });

const getMotion = (voteType: VoteType) =>
  getVoteButton(voteType)
    .querySelector('[data-vote-motion]')
    ?.getAttribute('data-vote-motion');

describe('ProposalVoteButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the block button when blocking is unrestricted', () => {
    renderButtons({ canBlock: false });

    expect(screen.getByText('proposals.actions.block')).toBeInTheDocument();
  });

  it('should hide the block button when restricted and the member lacks the permission', () => {
    renderButtons({ blocksOpenToAll: false, canBlock: false });

    expect(
      screen.queryByText('proposals.actions.block'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('proposals.actions.disagree')).toBeInTheDocument();
  });

  it('should keep the block button when restricted and the member holds the permission', () => {
    renderButtons({ blocksOpenToAll: false, canBlock: true });

    expect(screen.getByText('proposals.actions.block')).toBeInTheDocument();
  });

  it('should hide the block button on majority vote regardless of permission', () => {
    renderButtons({ canBlock: true, decisionMakingModel: 'majority-vote' });

    expect(
      screen.queryByText('proposals.actions.block'),
    ).not.toBeInTheDocument();
  });

  it('should mark only the current vote as pressed', () => {
    renderButtons({
      canBlock: true,
      myVote: { id: 'vote-1', voteType: 'disagree' },
    });

    expect(getVoteButton('disagree')).toHaveAttribute('aria-pressed', 'true');
    expect(getVoteButton('agree')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should select the vote and play its motion before the server responds', () => {
    apiMock.createVote.mockReturnValue(new Promise(() => {}));
    renderButtons({ canBlock: true });

    fireEvent.click(getVoteButton('agree'));

    expect(getVoteButton('agree')).toHaveAttribute('aria-pressed', 'true');
    expect(getMotion('agree')).toBe('select');
  });

  it('should ignore other votes while a vote is saving', async () => {
    apiMock.createVote.mockReturnValue(new Promise(() => {}));
    renderButtons({ canBlock: true });

    fireEvent.click(getVoteButton('agree'));
    fireEvent.click(getVoteButton('disagree'));
    await act(async () => {});

    expect(apiMock.createVote).toHaveBeenCalledTimes(1);
    expect(getVoteButton('agree')).toHaveAttribute('aria-pressed', 'true');
    expect(getVoteButton('disagree')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should roll back visibly and report the error when a vote fails', async () => {
    apiMock.createVote.mockRejectedValue(new Error('Network error'));
    renderButtons({ canBlock: true });

    await act(async () => {
      fireEvent.click(getVoteButton('block'));
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'proposals.actions.castBlockingVote',
        }),
      );
    });

    expect(getVoteButton('block')).toHaveAttribute('aria-pressed', 'false');
    expect(getMotion('block')).toBe('rollback');
    expect(handleErrorMock).toHaveBeenCalledTimes(1);
  });

  it('should give each vote type its own motion at equal weight', () => {
    const glyphs = Object.values(VOTE_GLYPHS);
    for (const glyph of glyphs) {
      expect(Object.keys(glyph).sort()).toEqual(Object.keys(glyphs[0]).sort());
      expect(Object.keys(VOTE_EASINGS)).toContain(glyph.selectEasing);
    }
    expect(new Set(glyphs.map((glyph) => glyph.selectKeyframes)).size).toBe(
      glyphs.length,
    );
    expect(new Set(glyphs.map((glyph) => glyph.flourish)).size).toBe(
      glyphs.length,
    );
  });
});
