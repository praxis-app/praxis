import { AuditLogFieldChange } from '@/components/audit-log/audit-log-field-change';
import { AuditLogMemberChanges } from '@/components/audit-log/audit-log-member-changes';
import { AuditLogPermissionChanges } from '@/components/audit-log/audit-log-permission-changes';
import { getAuditChanges } from '@/lib/audit-log.utils';
import { type AuditLogEntryRes } from '@/types/moderation.types';

type Props = Pick<AuditLogEntryRes, 'beforeValue' | 'afterValue'> & {
  targetKind: AuditLogEntryRes['target']['kind'];
};

export const AuditLogDetails = ({
  beforeValue,
  afterValue,
  targetKind,
}: Props) => {
  const { fields, permissions, members, count } = getAuditChanges(
    beforeValue,
    afterValue,
    targetKind === 'instance_role' ? 'instance' : 'server',
  );

  if (!count) {
    return null;
  }

  return (
    <div className="mt-3 grid min-w-0 gap-x-6 gap-y-4 rounded-lg bg-black/2 p-4 sm:grid-cols-2 dark:bg-black/10">
      {fields.map((change) => (
        <AuditLogFieldChange key={change.key} change={change} />
      ))}
      {!!permissions.length && (
        <AuditLogPermissionChanges changes={permissions} />
      )}
      {!!members.length && <AuditLogMemberChanges changes={members} />}
    </div>
  );
};
