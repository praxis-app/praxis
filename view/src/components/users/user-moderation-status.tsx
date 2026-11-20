import { Badge } from '@/components/ui/badge';
import { useUserModeration } from '@/hooks/use-user-moderation';
import { cn } from '@/lib/shared.utils';
import { useTranslation } from 'react-i18next';

interface Props {
  userId: string;
  className?: string;
}

export const UserModerationStatus = ({ userId, className }: Props) => {
  const { t } = useTranslation();
  const { account, server } = useUserModeration(userId);

  const isDeleted = !!account?.deletedAt;
  const isSuspended = !isDeleted && !!account?.locked;
  const isBanned = !!server?.isBanned;
  const isNotMember = !!server && !server.isMember && !isBanned;

  if (!isDeleted && !isSuspended && !isBanned && !isNotMember) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {isDeleted && (
        <Badge variant="outline">{t('moderation.labels.deleted')}</Badge>
      )}
      {isSuspended && (
        <Badge variant="destructive">{t('moderation.labels.suspended')}</Badge>
      )}
      {isBanned && (
        <Badge variant="destructive">
          {t('moderation.labels.bannedFromServer')}
        </Badge>
      )}
      {isNotMember && (
        <Badge variant="outline">
          {t('moderation.labels.notServerMember')}
        </Badge>
      )}
    </div>
  );
};
