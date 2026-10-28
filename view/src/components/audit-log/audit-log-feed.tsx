import { AuditLogEntry } from '@/components/audit-log/audit-log-entry';
import { AuditLogFeedMessage } from '@/components/audit-log/audit-log-feed-message';
import { AuditLogFeedSkeleton } from '@/components/audit-log/audit-log-feed-skeleton';
import { AuditLogFilters as FilterControls } from '@/components/audit-log/audit-log-filters/audit-log-filters';
import { Button } from '@/components/ui/button';
import { useAuditLogQuery } from '@/hooks/use-audit-log-query';
import { cn } from '@/lib/shared.utils';
import {
  type AuditLogFilters,
  type AuditLogScope,
} from '@/types/moderation.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCircleAlert, LuScrollText } from 'react-icons/lu';

export const AuditLogFeed = ({
  scope,
  serverId,
  enabled,
}: {
  scope: AuditLogScope;
  serverId?: string;
  enabled: boolean;
}) => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { t } = useTranslation();
  const query = useAuditLogQuery({ scope, serverId, filters, enabled });

  const entries = query.data?.pages.flatMap((page) => page.entries) || [];
  const filterValues = query.data?.pages[0]?.filterValues;
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const renderEntries = () => {
    if (query.isPending) {
      return <AuditLogFeedSkeleton />;
    }
    if (query.isError) {
      return (
        <AuditLogFeedMessage
          icon={LuCircleAlert}
          message={t('auditLog.states.error')}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              {t('auditLog.actions.retry')}
            </Button>
          }
        />
      );
    }
    if (entries.length === 0) {
      return (
        <AuditLogFeedMessage
          icon={LuScrollText}
          message={
            hasActiveFilters
              ? t('auditLog.states.emptyFiltered')
              : t('auditLog.states.empty')
          }
          action={
            hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
              >
                {t('auditLog.actions.clearFilters')}
              </Button>
            )
          }
        />
      );
    }
    return (
      <div
        aria-busy={query.isPlaceholderData}
        className={cn(
          'space-y-3 transition-opacity',
          query.isPlaceholderData && 'opacity-60',
        )}
      >
        {entries.map((entry) => (
          <AuditLogEntry key={entry.id} entry={entry} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <FilterControls
        scope={scope}
        filters={filters}
        filterValues={filterValues}
        onChange={setFilters}
      />
      {renderEntries()}
      {query.hasNextPage && !query.isPlaceholderData && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage
              ? t('auditLog.states.loadingMore')
              : t('auditLog.actions.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};
