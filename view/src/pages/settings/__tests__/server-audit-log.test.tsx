import { ServerAuditLog } from '@/pages/settings/server-audit-log';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/use-ability', () => ({
  useAbility: () => ({
    serverAbility: { can: () => false },
    instanceAbility: { can: () => false },
    isLoading: false,
  }),
}));
vi.mock('@/hooks/use-server-data', () => ({
  useServerData: () => ({
    serverId: 'server-1',
    serverPath: '/s/community',
  }),
}));
vi.mock('@/components/nav/top-nav', () => ({ TopNav: () => null }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ServerAuditLog', () => {
  it('renders permission denied for a direct unauthorized visit', () => {
    render(
      <MemoryRouter>
        <ServerAuditLog />
      </MemoryRouter>,
    );

    expect(screen.getByText('prompts.accessDenied')).toBeInTheDocument();
  });
});
