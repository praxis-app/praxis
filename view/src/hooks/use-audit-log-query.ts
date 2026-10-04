import { api } from '@/client/api-client';
import {
  type AuditLogFilters,
  type AuditLogScope,
} from '@/types/moderation.types';
import { useInfiniteQuery } from '@tanstack/react-query';

const AUDIT_LOG_PAGE_SIZE = 50;

export const getAuditLogQueryKey = (
  scope: AuditLogScope,
  serverId: string | undefined,
  filters: AuditLogFilters,
) => ['audit-log', scope, serverId, filters] as const;

export const useAuditLogQuery = ({
  scope,
  serverId,
  filters,
  enabled,
}: {
  scope: AuditLogScope;
  serverId?: string;
  filters: AuditLogFilters;
  enabled: boolean;
}) =>
  useInfiniteQuery({
    queryKey: getAuditLogQueryKey(scope, serverId, filters),
    queryFn: ({ pageParam }) => {
      const params = {
        ...filters,
        cursor: pageParam,
        limit: AUDIT_LOG_PAGE_SIZE,
      };
      if (scope === 'instance') {
        return api.getInstanceAuditLog(params);
      }
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerAuditLog(serverId, params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor || undefined : undefined,
    enabled: enabled && (scope === 'instance' || !!serverId),
  });
