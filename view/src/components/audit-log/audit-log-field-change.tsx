import { AuditLogFieldValue } from '@/components/audit-log/audit-log-field-value';
import {
  ProposalActionChange,
  ProposalActionChangeValue,
} from '@/components/polls/proposals/proposal-actions/proposal-action-change';
import {
  getAuditFieldLabel,
  type AuditFieldChange,
} from '@/lib/audit-log.utils';

export const AuditLogFieldChange = ({
  change,
}: {
  change: AuditFieldChange;
}) => {
  const { key, before, after, hasBefore, hasAfter } = change;
  const label = getAuditFieldLabel(key);

  if (hasBefore && hasAfter) {
    return (
      <ProposalActionChange
        label={label}
        oldValue={<AuditLogFieldValue field={key} value={before} />}
        proposedValue={<AuditLogFieldValue field={key} value={after} />}
      />
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="font-medium">{label}</div>
      <ProposalActionChangeValue changeType={hasAfter ? 'add' : 'remove'}>
        <AuditLogFieldValue field={key} value={hasAfter ? after : before} />
      </ProposalActionChangeValue>
    </div>
  );
};
