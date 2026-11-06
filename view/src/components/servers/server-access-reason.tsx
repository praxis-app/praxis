import { formatDate } from '@/lib/time.utils';
import { type ServerAccessRes } from '@/types/server.types';
import { useTranslation } from 'react-i18next';

interface Props {
  access: Pick<ServerAccessRes, 'reason' | 'moderatedAt'>;
}

export const ServerAccessReason = ({
  access: { reason, moderatedAt },
}: Props) => {
  const { t } = useTranslation();

  if (!reason) {
    return null;
  }

  return (
    <div className="bg-muted/50 space-y-1 rounded-lg border p-4">
      <p className="text-sm font-medium">{t('servers.access.reasonLabel')}</p>
      <p className="text-sm wrap-break-word whitespace-pre-wrap">{reason}</p>
      {moderatedAt && (
        <p className="text-muted-foreground text-xs">
          {formatDate(moderatedAt)}
        </p>
      )}
    </div>
  );
};
