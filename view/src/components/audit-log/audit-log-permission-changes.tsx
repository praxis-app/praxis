import { ProposalActionAccordion } from '@/components/polls/proposals/proposal-actions/proposal-action-accordion';
import { ProposalActionChangeValue } from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import {
  getAuditPermissionLabel,
  getGrantedPermissionNames,
  type AuditPermissionScope,
} from '@/lib/audit-log.utils';
import { useTranslation } from 'react-i18next';

const ACCORDION_ITEM_VALUE = 'audit-log-permission-changes';

interface Props {
  beforeValue: unknown;
  afterValue: unknown;
  hasBefore: boolean;
  hasAfter: boolean;
  scope: AuditPermissionScope;
}

export const AuditLogPermissionChanges = ({
  beforeValue,
  afterValue,
  hasBefore,
  hasAfter,
  scope,
}: Props) => {
  const { t } = useTranslation();

  const before = hasBefore ? getGrantedPermissionNames(beforeValue, scope) : [];
  const after = hasAfter ? getGrantedPermissionNames(afterValue, scope) : [];
  const changes = [
    ...after
      .filter((name) => !before.includes(name))
      .map((name) => ({ name, changeType: 'add' as const })),
    ...before
      .filter((name) => !after.includes(name))
      .map((name) => ({ name, changeType: 'remove' as const })),
  ];

  if (!changes.length) {
    return null;
  }

  return (
    <ProposalActionAccordion
      value={ACCORDION_ITEM_VALUE}
      className="mb-0"
      summary={
        <>
          {t('auditLog.fields.permissions')}
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            {t('auditLog.permissions.changeCount', { count: changes.length })}
          </span>
        </>
      }
    >
      {changes.map(({ name, changeType }) => (
        <ProposalActionChangeValue key={name} changeType={changeType}>
          {getAuditPermissionLabel(name)}
        </ProposalActionChangeValue>
      ))}
    </ProposalActionAccordion>
  );
};
