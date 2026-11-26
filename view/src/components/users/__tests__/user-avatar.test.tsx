// Regression: after returning to the tab, one avatar in a list that shared
// the same image showed "file missing" while the others loaded. Returning to
// the tab refetched every image, and a failed refetch only ran the first
// subscriber's onError, leaving that avatar broken. In the chat feed, that
// subscriber is the bottom avatar because of flex-col-reverse. The failure was
// likely a dropped idle connection after ~5 minutes away (unconfirmed)

import { api } from '@/client/api-client';
import { UserAvatar } from '@/components/users/user-avatar';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/hooks/use-server-data', () => ({
  useServerData: () => ({ serverId: undefined }),
}));
vi.mock('@/client/api-client', () => ({
  api: { getUserImage: vi.fn() },
}));

class VisibleIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
  unobserve() {}
  disconnect() {}
}

const leaveAndReturnToTab = () =>
  act(() => {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
  });

describe('UserAvatar', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', VisibleIntersectionObserver);
    let blobCount = 0;
    vi.mocked(URL.createObjectURL).mockImplementation(
      () => `blob:avatar-${++blobCount}`,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    focusManager.setFocused(undefined);
  });

  it('should keep every shared avatar visible after a failed refetch on returning to the tab', async () => {
    vi.mocked(api.getUserImage)
      .mockResolvedValueOnce(new Blob(['avatar']))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValue(new Blob(['avatar']));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        {['first', 'middle', 'last'].map((key) => (
          <UserAvatar
            key={key}
            name="forrest"
            userId="user-1"
            imageId="img-1"
          />
        ))}
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByAltText('forrest')).toHaveLength(3),
    );

    await leaveAndReturnToTab();
    await waitFor(() =>
      expect(queryClient.isFetching({ queryKey: ['images'] })).toBe(0),
    );
    await leaveAndReturnToTab();
    await waitFor(() =>
      expect(queryClient.isFetching({ queryKey: ['images'] })).toBe(0),
    );

    const avatarsShowingImage = screen
      .getAllByTitle('forrest')
      .map((avatar) => !!within(avatar).queryByAltText('forrest'));
    expect(avatarsShowingImage).toEqual([true, true, true]);
    expect(
      screen.queryByText('images.errors.fileMissing'),
    ).not.toBeInTheDocument();
  });
});
