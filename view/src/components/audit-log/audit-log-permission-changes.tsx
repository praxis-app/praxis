import { ProposalActionChangeValue } from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import {
  getAuditPermissionLabel,
  type getAuditChanges,
} from '@/lib/audit-log.utils';
import { useTranslation } from 'react-i18next';

interface Props {
  changes: ReturnType<typeof getAuditChanges>['permissions'];
}

export const AuditLogPermissionChanges = ({ changes }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-full min-w-0 space-y-2">
      <div className="font-medium">{t('proposals.headers.permissions')}</div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {changes.map(({ name, changeType }) => (
          <ProposalActionChangeValue key={name} changeType={changeType}>
            {getAuditPermissionLabel(name)}
          </ProposalActionChangeValue>
        ))}
      </div>
    </div>
  );
};
