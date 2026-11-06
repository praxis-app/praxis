import { DatePicker } from '@/components/shared/date-picker';
import { Button } from '@/components/ui/button';
import { parseDateValue, toDateValue } from '@/lib/event.utils';
import {
  type AuditLogFilterValuesRes,
  type AuditLogFilters as AuditLogFilterState,
  type AuditLogScope,
} from '@/types/moderation.types';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';
import { AuditLogFilterSelect } from './audit-log-filter-select';
import { AuditLogTargetIdInput } from './audit-log-target-id-input';

const FIELD_CLASS_NAME = 'min-w-48 flex-1';
const DATE_TRIGGER_CLASS_NAME =
  'dark:bg-input/30 dark:hover:bg-input/50 h-9 rounded-md bg-transparent px-3 text-sm shadow-xs hover:bg-transparent sm:h-9 [&>svg]:size-4';

const toFilterDate = (dateValue: string, endOfDay: boolean) =>
  dateValue
    ? new Date(
        `${dateValue}T${endOfDay ? '23:59:59.999' : '00:00:00'}`,
      ).toISOString()
    : undefined;

const toDateInputValue = (filterDate?: string) =>
  filterDate ? toDateValue(new Date(filterDate)) : '';

const countActiveFilters = (filters: AuditLogFilterState) =>
  Object.values(filters).filter(Boolean).length;

interface Props {
  scope: AuditLogScope;
  filters: AuditLogFilterState;
  filterValues?: AuditLogFilterValuesRes;
  onChange: (filters: AuditLogFilterState) => void;
}

export const AuditLogFilters = ({
  scope,
  filters,
  filterValues,
  onChange,
}: Props) => {
  const { t } = useTranslation();

  const activeCount = countActiveFilters(filters);
  const fromValue = toDateInputValue(filters.from);
  const toValue = toDateInputValue(filters.to);

  const actionOptions =
    filterValues?.actions.map((action) => ({
      value: action,
      label: t(`auditLog.actions.${action}`),
    })) ?? [];
  const actorOptions =
    filterValues?.actors.map((actor) => ({
      value: actor.id,
      label: actor.label,
    })) ?? [];
  const targetKindOptions =
    filterValues?.targetKinds.map((kind) => ({
      value: kind,
      label: t(`auditLog.targets.${kind}`),
    })) ?? [];
  const serverOptions =
    filterValues?.servers.flatMap((server) =>
      server.serverId
        ? [{ value: server.serverId, label: server.serverLabel ?? '' }]
        : [],
    ) ?? [];

  const setFilter = <K extends keyof AuditLogFilterState>(
    name: K,
    value?: AuditLogFilterState[K],
  ) => onChange({ ...filters, [name]: value });

  return (
    <section aria-labelledby="audit-log-filters-heading" className="space-y-3">
      <div className="flex h-8 items-center justify-between gap-2">
        <h2
          id="audit-log-filters-heading"
          className="text-muted-foreground text-sm font-medium"
        >
          {t('auditLog.filters.heading')}
          {activeCount > 0 && (
            <span className="text-foreground ml-1.5">
              {t('auditLog.filters.activeCount', { count: activeCount })}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({})}
          >
            <LuX />
            {t('auditLog.actions.clearFilters')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className={FIELD_CLASS_NAME}>
          <AuditLogFilterSelect
            label={t('auditLog.filters.action')}
            value={filters.action}
            options={actionOptions}
            onChange={(value) =>
              setFilter('action', value as AuditLogFilterState['action'])
            }
          />
        </div>
        <div className={FIELD_CLASS_NAME}>
          <AuditLogFilterSelect
            label={t('auditLog.filters.actor')}
            value={filters.actorId}
            options={actorOptions}
            onChange={(value) => setFilter('actorId', value)}
          />
        </div>
        <div className={FIELD_CLASS_NAME}>
          <AuditLogFilterSelect
            label={t('auditLog.filters.targetKind')}
            value={filters.targetKind}
            options={targetKindOptions}
            onChange={(value) =>
              setFilter(
                'targetKind',
                value as AuditLogFilterState['targetKind'],
              )
            }
          />
        </div>
        {scope === 'instance' && (
          <div className={FIELD_CLASS_NAME}>
            <AuditLogFilterSelect
              label={t('auditLog.filters.server')}
              value={filters.serverId}
              options={serverOptions}
              onChange={(value) => setFilter('serverId', value)}
            />
          </div>
        )}
        <div className={FIELD_CLASS_NAME}>
          <DatePicker
            id="audit-log-from"
            label={t('auditLog.filters.startDate')}
            placeholder={t('auditLog.filters.startDate')}
            value={fromValue}
            maxDate={parseDateValue(toValue) ?? undefined}
            className={DATE_TRIGGER_CLASS_NAME}
            onChange={(value) => setFilter('from', toFilterDate(value, false))}
          />
        </div>
        <div className={FIELD_CLASS_NAME}>
          <DatePicker
            id="audit-log-to"
            label={t('auditLog.filters.endDate')}
            placeholder={t('auditLog.filters.endDate')}
            value={toValue}
            minDate={parseDateValue(fromValue) ?? undefined}
            className={DATE_TRIGGER_CLASS_NAME}
            onChange={(value) => setFilter('to', toFilterDate(value, true))}
          />
        </div>
        <div className={FIELD_CLASS_NAME}>
          <AuditLogTargetIdInput
            value={filters.targetId}
            onChange={(value) => setFilter('targetId', value)}
          />
        </div>
      </div>
    </section>
  );
};
