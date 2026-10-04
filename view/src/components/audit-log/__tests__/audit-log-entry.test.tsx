import { AuditLogEntry } from '@/components/audit-log/audit-log-entry';
import { type AuditLogEntryRes } from '@/types/moderation.types';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const entry: AuditLogEntryRes = {
  id: 'entry-1',
  actor: null,
  origin: 'proposal',
  proposalId: 'proposal-1',
  action: 'update_role',
  target: { kind: 'server_role', id: 'role-1', label: 'Facilitator' },
  scope: {
    serverId: 'server-1',
    serverLabel: 'Community',
    channelId: 'channel-1',
  },
  reason: null,
  beforeValue: { name: 'Member' },
  afterValue: { name: 'Facilitator' },
  createdAt: '2026-10-03T12:00:00Z',
  applicationPath: '/s/community/c/channel-1/posts/post-1',
};

describe('AuditLogEntry', () => {
  it('renders proposal links and before and after details as text', () => {
    render(
      <MemoryRouter>
        <AuditLogEntry entry={entry} />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('auditLog.actions.update_role').nextElementSibling,
    ).toHaveTextContent('auditLog.origins.proposal');
    expect(screen.getByRole('link', { name: 'Facilitator' })).toHaveAttribute(
      'href',
      '/s/community/c/channel-1/posts/post-1',
    );
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getAllByText('Facilitator')).toHaveLength(2);
  });

  it('does not create a link without an API-supplied application path', () => {
    render(
      <MemoryRouter>
        <AuditLogEntry entry={{ ...entry, applicationPath: null }} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Facilitator' })).toBeNull();
  });
});
