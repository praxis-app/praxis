import { AuditLogEntry } from '@/components/audit-log/audit-log-entry';
import { AuditLogFilters as FilterControls } from '@/components/audit-log/audit-log-filters';
import { Button } from '@/components/ui/button';
import { useAuditLogQuery } from '@/hooks/use-audit-log-query';
import {
  type AuditLogFilters,
  type AuditLogScope,
} from '@/types/moderation.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const AuditLogFeed = ({
  scope,
  serverId,
  enabled,
}: {
  scope: AuditLogScope;
  serverId?: string;
  enabled: boolean;
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const query = useAuditLogQuery({ scope, serverId, filters, enabled });
  const entries = query.data?.pages.flatMap((page) => page.entries) || [];
  const filterValues = query.data?.pages[0]?.filterValues;

  return (
    <div className="space-y-4">
      <FilterControls
        scope={scope}
        filters={filters}
        filterValues={filterValues}
        onChange={setFilters}
      />
      {query.isPending && <p>{t('auditLog.states.loading')}</p>}
      {query.isError && <p>{t('auditLog.states.error')}</p>}
      {!query.isPending && !query.isError && entries.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">
          {t('auditLog.states.empty')}
        </p>
      )}
      <div className="space-y-3">
        {entries.map((entry) => (
          <AuditLogEntry key={entry.id} entry={entry} />
        ))}
      </div>
      {query.hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage
              ? t('auditLog.states.loading')
              : t('auditLog.actions.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};
