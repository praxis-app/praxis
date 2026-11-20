import {
  formatServerConfigValue,
  isServerConfigField,
} from '@/components/polls/proposals/server-config-changes.utils';
import { ProposalActionColorValue } from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import { useTranslation } from 'react-i18next';

interface Props {
  field: string;
  value: unknown;
}

export const AuditLogFieldValue = ({ field, value }: Props) => {
  const { t } = useTranslation();

  if (value === null || value === undefined || value === '') {
    return (
      <span className="text-muted-foreground">{t('auditLog.labels.none')}</span>
    );
  }
  if (isServerConfigField(field)) {
    return <>{formatServerConfigValue(field, value)}</>;
  }
  if (field === 'color' && typeof value === 'string') {
    return <ProposalActionColorValue color={value} />;
  }
  if (typeof value === 'boolean') {
    return <>{t(value ? 'actions.enabled' : 'actions.disabled')}</>;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return <>{value}</>;
  }
  return (
    <span className="text-muted-foreground">
      {t('auditLog.labels.unavailable')}
    </span>
  );
};
