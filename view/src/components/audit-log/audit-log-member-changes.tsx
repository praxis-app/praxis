import {
  ProposalActionChangeValue,
  ProposalActionMemberValue,
} from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import { type getAuditChanges } from '@/lib/audit-log.utils';
import { useTranslation } from 'react-i18next';

interface Props {
  changes: ReturnType<typeof getAuditChanges>['members'];
}

export const AuditLogMemberChanges = ({ changes }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="col-span-full min-w-0 space-y-2">
      <div className="font-medium">{t('proposals.headers.memberChanges')}</div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {changes.map(({ member, changeType }) => (
          <ProposalActionChangeValue key={member.id} changeType={changeType}>
            <ProposalActionMemberValue
              user={{ id: member.id, name: member.name, profilePicture: null }}
            />
          </ProposalActionChangeValue>
        ))}
      </div>
    </div>
  );
};
