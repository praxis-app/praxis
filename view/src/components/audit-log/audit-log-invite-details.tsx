import { AuditLogInviteChip } from '@/components/audit-log/audit-log-invite-chip';
import { getAuditInviteSettings } from '@/lib/audit-log.utils';
import { cn } from '@/lib/shared.utils';
import { type AuditLogEntryRes } from '@/types/moderation.types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { LuClock3, LuLink, LuLogIn, LuUnlink, LuUsers } from 'react-icons/lu';

type Props = Pick<AuditLogEntryRes, 'beforeValue' | 'afterValue'>;

export const AuditLogInviteDetails = ({ beforeValue, afterValue }: Props) => {
  const { t } = useTranslation();

  const { isDeleted, maxUses, expiresAt, uses } = getAuditInviteSettings(
    beforeValue,
    afterValue,
  );
  const LinkIcon = isDeleted ? LuUnlink : LuLink;

  return (
    <div className="mt-3 flex items-start gap-3 rounded-lg bg-black/2 p-3 dark:bg-black/10">
      <span
        className={cn(
          'flex size-7.5 shrink-0 items-center justify-center rounded-md',
          isDeleted
            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        )}
      >
        <LinkIcon className="size-4" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <AuditLogInviteChip Icon={LuUsers}>
          {maxUses === null
            ? t('auditLog.invite.noUseLimit')
            : t('auditLog.invite.maxUses', { count: maxUses })}
        </AuditLogInviteChip>
        <AuditLogInviteChip Icon={LuClock3}>
          {expiresAt
            ? t('auditLog.invite.expires', {
                date: dayjs(expiresAt).format('MMM D, YYYY h:mm A'),
              })
            : t('auditLog.invite.neverExpires')}
        </AuditLogInviteChip>
        {uses !== null && (
          <AuditLogInviteChip Icon={LuLogIn}>
            {t('auditLog.invite.uses', { count: uses })}
          </AuditLogInviteChip>
        )}
      </div>
    </div>
  );
};
