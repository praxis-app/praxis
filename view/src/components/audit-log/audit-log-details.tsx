import { type AuditLogEntryRes } from '@/types/moderation.types';
import { useTranslation } from 'react-i18next';

const displayValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

export const AuditLogDetails = ({
  beforeValue,
  afterValue,
}: Pick<AuditLogEntryRes, 'beforeValue' | 'afterValue'>) => {
  const { t } = useTranslation();
  const before =
    beforeValue &&
    typeof beforeValue === 'object' &&
    !Array.isArray(beforeValue)
      ? (beforeValue as Record<string, unknown>)
      : null;
  const after =
    afterValue && typeof afterValue === 'object' && !Array.isArray(afterValue)
      ? (afterValue as Record<string, unknown>)
      : null;
  const keys = Array.from(
    new Set([...Object.keys(before || {}), ...Object.keys(after || {})]),
  );

  if (!beforeValue && !afterValue) {
    return null;
  }

  return (
    <div className="bg-muted/50 mt-3 rounded-md px-3 py-2 text-sm">
      {keys.length ? (
        <dl className="space-y-2">
          {keys.map((key) => (
            <div key={key} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
              <dt className="font-medium wrap-break-word">{key}</dt>
              <dd className="min-w-0 wrap-break-word">
                <span>{displayValue(before?.[key])}</span>
                <span aria-hidden="true"> → </span>
                <span>{displayValue(after?.[key])}</span>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <div className="font-medium">{t('auditLog.labels.before')}</div>
            <div className="wrap-break-word">{displayValue(beforeValue)}</div>
          </div>
          <div>
            <div className="font-medium">{t('auditLog.labels.after')}</div>
            <div className="wrap-break-word">{displayValue(afterValue)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
