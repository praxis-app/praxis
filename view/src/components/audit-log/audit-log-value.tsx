import { useTranslation } from 'react-i18next';

const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

export const AuditLogValue = ({ value }: { value: unknown }) => {
  const { t } = useTranslation();

  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof value === 'boolean') {
    return (
      <span>
        {value
          ? t('permissions.states.enabled')
          : t('permissions.states.disabled')}
      </span>
    );
  }
  if (typeof value === 'string' && HEX_COLOR_REGEX.test(value)) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full border"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs">{value}</span>
      </span>
    );
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return <span>{value}</span>;
  }
  return <span>{JSON.stringify(value)}</span>;
};
