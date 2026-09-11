import { Feed } from '@/components/feeds/feed';
import { useAuthStore } from '@/store/auth.store';
import { customRender as render } from '@/test/lib/custom-render';
import { type ChannelRes, type FeedItemRes } from '@/types/channel.types';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

vi.mock('@/store/auth.store');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/use-infinite-scroll', () => ({
  useInfiniteScroll: vi.fn(() => vi.fn()),
}));
vi.mock('@/hooks/use-sign-up-data', () => ({
  useSignUpData: vi.fn(() => ({
    signUpPath: '/sign-up',
    showSignUp: true,
  })),
}));
vi.mock('@/lib/shared.utils', () => ({
  cn: vi.fn((...args) => args.join(' ')),
  t: vi.fn((key) => key),
}));
vi.mock('../invites/welcome-message', () => ({
  WelcomeMessage: ({ onDismiss }: { onDismiss: () => void }) => (
    <div data-testid="welcome-message">
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  ),
}));
vi.mock('../../messages/bot-message', () => ({
  BotMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="welcome-message">{children}</div>
  ),
}));
vi.mock('@/components/shared/formatted-text', () => ({
  FormattedText: ({ text }: { text: string }) => <div>{text}</div>,
}));
vi.mock('@/components/messages/message', () => ({
  Message: ({ message }: { message: { body: string } }) => (
    <div data-testid="message">{message.body}</div>
  ),
}));
vi.mock('@/components/polls/inline-poll', () => ({
  InlinePoll: () => <div data-testid="inline-poll" />,
}));
vi.mock('@/components/polls/proposals/inline-proposal/inline-proposal', () => ({
  InlineProposal: () => <div data-testid="inline-proposal" />,
}));

describe('Feed', () => {
  const mockOnLoadMore = vi.fn();
  const mockFeedBoxRef = { current: document.createElement('div') };
  const mockChannel: ChannelRes = {
    id: 'channel-1',
    name: 'general',
    description: null,
  };
  const mockFeed: FeedItemRes[] = [
    {
      type: 'message',
      id: '1',
      body: 'Hello world',
      user: {
        id: 'user1',
        name: 'John Doe',
        profilePicture: null,
      },
      userId: 'user1',
      botId: null,
      bot: null,
      commandStatus: null,
      replyCount: 0,
      latestReplyAt: null,
      createdAt: '2023-12-01T12:00:00Z',
    },
    {
      type: 'message',
      id: '2',
      body: 'Another message',
      user: {
        id: 'user2',
        name: 'Jane Smith',
        profilePicture: null,
      },
      userId: 'user2',
      botId: null,
      bot: null,
      commandStatus: null,
      replyCount: 0,
      latestReplyAt: null,
      createdAt: '2023-12-01T12:05:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuthStore as unknown as Mock).mockClear();
  });

  it('should render messages when they are provided', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isLoggedIn: true,
      isAppLoading: false,
    });

    render(
      <Feed
        channel={mockChannel}
        feed={mockFeed}
        feedQueryKey={['feed']}
        feedBoxRef={mockFeedBoxRef}
        onLoadMore={mockOnLoadMore}
        isLastPage={false}
        isLoadingMore={false}
      />,
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Another message')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
  });

  it('should render the welcome message when user is not logged in and there are no messages', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isLoggedIn: false,
      isAppLoading: false,
    });

    render(
      <Feed
        feed={[]}
        feedQueryKey={['feed']}
        feedBoxRef={mockFeedBoxRef}
        onLoadMore={mockOnLoadMore}
        isLastPage={false}
        isLoadingMore={false}
      />,
    );

    expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
  });
});
