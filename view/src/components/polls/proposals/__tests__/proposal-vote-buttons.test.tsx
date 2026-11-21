import { ProposalVoteButtons } from '@/components/polls/proposals/proposal-vote-buttons/proposal-vote-buttons';
import { type ChannelRes } from '@/types/channel.types';
import {
  type DecisionMakingModel,
  type PollConfigRes,
} from '@/types/poll.types';
import { type VoteRes } from '@/types/vote.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const canMock = vi.fn();

vi.mock('@/client/api-client', () => ({ api: {} }));
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

  const config: PollConfigRes = { decisionMakingModel, blocksOpenToAll };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <ProposalVoteButtons
        channel={channel}
        pollId="poll-1"
        myVote={myVote}
        stage="voting"
        decisionMakingModel={decisionMakingModel}
        config={config}
        votes={[]}
        memberCount={3}
      />
    </QueryClientProvider>,
  );
};

describe('ProposalVoteButtons', () => {
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

    expect(
      screen.getByRole('button', { name: 'proposals.actions.disagree' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'proposals.actions.agree' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('should mark no vote as pressed before voting', () => {
    renderButtons({ canBlock: true });

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
