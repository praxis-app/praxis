import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type AuditLogFilterValuesRes,
  type AuditLogFilters as AuditLogFilterState,
  type AuditLogScope,
} from '@/types/moderation.types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const ALL = 'all';

const dateFilter = (value: string, endOfDay: boolean) =>
  value
    ? new Date(
        `${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`,
      ).toISOString()
    : undefined;

export const AuditLogFilters = ({
  scope,
  filters,
  filterValues,
  onChange,
}: {
  scope: AuditLogScope;
  filters: AuditLogFilterState;
  filterValues?: AuditLogFilterValuesRes;
  onChange: (filters: AuditLogFilterState) => void;
}) => {
  const { t } = useTranslation();
  const setFilter = (name: keyof AuditLogFilterState, value?: string) =>
    onChange({ ...filters, [name]: value || undefined });

  return (
    <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="audit-action">{t('auditLog.filters.action')}</Label>
        <select
          id="audit-action"
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          value={filters.action || ALL}
          onChange={(event) =>
            setFilter(
              'action',
              event.target.value === ALL ? undefined : event.target.value,
            )
          }
        >
          <option value={ALL}>{t('auditLog.filters.all')}</option>
          {filterValues?.actions.map((action) => (
            <option key={action} value={action}>
              {t(`auditLog.actions.${action}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-actor">{t('auditLog.filters.actor')}</Label>
        <select
          id="audit-actor"
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          value={filters.actorId || ALL}
          onChange={(event) =>
            setFilter(
              'actorId',
              event.target.value === ALL ? undefined : event.target.value,
            )
          }
        >
          <option value={ALL}>{t('auditLog.filters.all')}</option>
          {filterValues?.actors.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-target-kind">
          {t('auditLog.filters.targetKind')}
        </Label>
        <select
          id="audit-target-kind"
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          value={filters.targetKind || ALL}
          onChange={(event) =>
            setFilter(
              'targetKind',
              event.target.value === ALL ? undefined : event.target.value,
            )
          }
        >
          <option value={ALL}>{t('auditLog.filters.all')}</option>
          {filterValues?.targetKinds.map((kind) => (
            <option key={kind} value={kind}>
              {t(`auditLog.targets.${kind}`)}
            </option>
          ))}
        </select>
      </div>
      {scope === 'instance' && (
        <div className="space-y-2">
          <Label htmlFor="audit-server">{t('auditLog.filters.server')}</Label>
          <select
            id="audit-server"
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            value={filters.serverId || ALL}
            onChange={(event) =>
              setFilter(
                'serverId',
                event.target.value === ALL ? undefined : event.target.value,
              )
            }
          >
            <option value={ALL}>{t('auditLog.filters.all')}</option>
            {filterValues?.servers.map(
              (server) =>
                server.serverId && (
                  <option key={server.serverId} value={server.serverId}>
                    {server.serverLabel}
                  </option>
                ),
            )}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="audit-target-id">
          {t('auditLog.filters.targetId')}
        </Label>
        <Input
          id="audit-target-id"
          value={filters.targetId || ''}
          onChange={(event) => setFilter('targetId', event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-from">{t('auditLog.filters.from')}</Label>
        <Input
          id="audit-from"
          type="date"
          value={filters.from ? dayjs(filters.from).format('YYYY-MM-DD') : ''}
          onChange={(event) =>
            setFilter('from', dateFilter(event.target.value, false))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audit-to">{t('auditLog.filters.to')}</Label>
        <Input
          id="audit-to"
          type="date"
          value={filters.to ? dayjs(filters.to).format('YYYY-MM-DD') : ''}
          onChange={(event) =>
            setFilter('to', dateFilter(event.target.value, true))
          }
        />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          disabled={!Object.values(filters).some(Boolean)}
          onClick={() => onChange({})}
        >
          {t('auditLog.actions.clearFilters')}
        </Button>
      </div>
    </div>
  );
};
