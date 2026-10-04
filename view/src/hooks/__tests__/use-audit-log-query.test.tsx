import { api } from '@/client/api-client';
import { useAuditLogQuery } from '@/hooks/use-audit-log-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/client/api-client', () => ({
  api: {
    getServerAuditLog: vi.fn(),
    getInstanceAuditLog: vi.fn(),
  },
}));

const response = (nextCursor: string | null, hasMore: boolean) => ({
  entries: [],
  nextCursor,
  hasMore,
  filterValues: { actors: [], servers: [], actions: [], targetKinds: [] },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe('useAuditLogQuery', () => {
  it('includes scope and filters in requests and follows the cursor', async () => {
    vi.mocked(api.getServerAuditLog)
      .mockResolvedValueOnce(response('next-page', true))
      .mockResolvedValueOnce(response(null, false));

    const { result } = renderHook(
      () =>
        useAuditLogQuery({
          scope: 'server',
          serverId: 'server-1',
          filters: { action: 'ban_member' },
          enabled: true,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getServerAuditLog).toHaveBeenCalledWith('server-1', {
      action: 'ban_member',
      cursor: undefined,
      limit: 50,
    });

    await act(async () => result.current.fetchNextPage());
    expect(api.getServerAuditLog).toHaveBeenLastCalledWith('server-1', {
      action: 'ban_member',
      cursor: 'next-page',
      limit: 50,
    });
  });

  it('does not fetch before permission is available', () => {
    renderHook(
      () =>
        useAuditLogQuery({
          scope: 'instance',
          filters: {},
          enabled: false,
        }),
      { wrapper },
    );

    expect(api.getInstanceAuditLog).not.toHaveBeenCalled();
  });
});
