import { AuditLogPermissionChanges } from '@/components/audit-log/audit-log-permission-changes';
import { AuditLogValue } from '@/components/audit-log/audit-log-value';
import { getAuditFieldLabel, toAuditRecord } from '@/lib/audit-log.utils';
import { type AuditLogEntryRes } from '@/types/moderation.types';
import { useTranslation } from 'react-i18next';
import { LuArrowRight } from 'react-icons/lu';

const PERMISSIONS_KEY = 'permissions';

type Props = Pick<AuditLogEntryRes, 'beforeValue' | 'afterValue'> & {
  targetKind: AuditLogEntryRes['target']['kind'];
};

export const AuditLogDetails = ({
  beforeValue,
  afterValue,
  targetKind,
}: Props) => {
  const { t } = useTranslation();

  const before = toAuditRecord(beforeValue);
  const after = toAuditRecord(afterValue);
  const isDiff = !!before && !!after;
  const keys = Array.from(
    new Set([...Object.keys(before || {}), ...Object.keys(after || {})]),
  ).filter(
    (key) =>
      !isDiff || JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
  const fieldKeys = keys.filter((key) => key !== PERMISSIONS_KEY);
  const hasPermissions = keys.includes(PERMISSIONS_KEY);

  if (!keys.length) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {!!fieldKeys.length && (
        <dl className="bg-muted/50 space-y-3 rounded-md px-3 py-2.5 text-sm">
          {fieldKeys.map((key) => (
            <div key={key} className="grid gap-1.5 sm:grid-cols-[10rem_1fr]">
              <dt className="text-muted-foreground font-medium">
                {getAuditFieldLabel(key)}
              </dt>
              <dd className="min-w-0 wrap-break-word">
                {isDiff ? (
                  <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                    <AuditLogValue value={before[key]} />
                    <LuArrowRight
                      aria-label={t('auditLog.labels.changedTo')}
                      className="text-muted-foreground size-3.5 shrink-0"
                    />
                    <AuditLogValue value={after[key]} />
                  </span>
                ) : (
                  <AuditLogValue value={(after ?? before)?.[key]} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {hasPermissions && (
        <AuditLogPermissionChanges
          beforeValue={before?.[PERMISSIONS_KEY]}
          afterValue={after?.[PERMISSIONS_KEY]}
          hasBefore={!!before}
          hasAfter={!!after}
          scope={targetKind === 'instance_role' ? 'instance' : 'server'}
        />
      )}
    </div>
  );
};
