import { Message } from '@/components/messages/message';
import { customRender as render } from '@/test/lib/custom-render';
import { type MessageRes } from '@/types/message.types';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/use-is-desktop', () => ({
  useIsDesktop: () => true,
}));
vi.mock('@/components/users/user-profile-drawer', () => ({
  UserProfileDrawer: ({ trigger }: { trigger: React.ReactNode }) => trigger,
}));
vi.mock('@/components/users/user-avatar', () => ({
  UserAvatar: () => <span />,
}));
vi.mock('@/components/shared/formatted-text', () => ({
  FormattedText: ({ text }: { text: string }) => <p>{text}</p>,
}));

const message: MessageRes = {
  id: 'message-1',
  body: 'Buy now',
  user: { id: 'user-1', name: 'member', profilePicture: null },
  userId: 'user-1',
  botId: null,
  bot: null,
  replyCount: 0,
  latestReplyAt: null,
  createdAt: '2026-01-01T00:00:00Z',
};

const openMenu = () => {
  fireEvent.keyDown(
    screen.getByRole('button', { name: 'messages.actions.openMenu' }),
    { key: 'Enter' },
  );
};

describe('Message', () => {
  it('should render a tombstone in place of removed content', () => {
    render(
      <Message
        message={{ ...message, body: null, moderatedAt: '2026-01-02' }}
      />,
    );

    expect(
      screen.getByText('moderation.labels.removedByModerator'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Buy now')).not.toBeInTheDocument();
  });

  it('should offer removal only when a remove handler is provided', () => {
    const { rerender } = render(<Message message={message} />);
    expect(
      screen.queryByRole('button', { name: 'messages.actions.openMenu' }),
    ).not.toBeInTheDocument();

    rerender(<Message message={message} onRemove={vi.fn()} />);
    openMenu();

    expect(
      screen.getByRole('menuitem', { name: 'moderation.actions.removeMessage' }),
    ).toBeInTheDocument();
  });

  it('should confirm removal with the entered reason', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined);
    render(<Message message={message} onRemove={onRemove} />);
    openMenu();
    fireEvent.click(
      screen.getByRole('menuitem', { name: 'moderation.actions.removeMessage' }),
    );

    const reason = await screen.findByRole('textbox');
    fireEvent.change(reason, { target: { value: '  Spam links  ' } });
    fireEvent.click(
      screen.getByRole('button', { name: 'moderation.actions.remove' }),
    );

    await vi.waitFor(() => expect(onRemove).toHaveBeenCalled());
    expect(onRemove.mock.calls[0][0]).toBe('Spam links');
  });
});
