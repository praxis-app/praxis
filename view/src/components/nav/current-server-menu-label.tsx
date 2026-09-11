import { useTranslation } from 'react-i18next';
import { LuServer } from 'react-icons/lu';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { type ServerRes } from '@/types/server.types';

interface Props {
  serverName: string;
  server?: ServerRes;
}

export const CurrentServerMenuLabel = ({ serverName, server }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-1 text-left">
      <span className="text-muted-foreground text-xs font-normal">
        {t('servers.labels.current')}
      </span>
      <div className="flex min-w-0 items-center gap-2">
        {server?.image ? (
          <ServerAvatar server={server} className="size-5 shrink-0" />
        ) : (
          <span className="flex size-5 shrink-0 items-center justify-center">
            <LuServer className="text-muted-foreground size-4" />
          </span>
        )}
        <span className="min-w-0 truncate font-medium">{serverName}</span>
      </div>
    </div>
  );
};
