import { api } from '@/client/api-client';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/time.utils';
import { type ServerRes } from '@/types/server.types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdCalendarToday, MdPeople } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  server: ServerRes;
  membersPath?: string;
}

export const CurrentServerCard = ({ server, membersPath }: Props) => {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['me', 'servers'],
    queryFn: api.getCurrentUserServers,
  });

  const memberCount =
    server.memberCount ??
    data?.servers.find(({ id }) => id === server.id)?.memberCount;

  return (
    <Card className="mb-4 flex-row gap-0 overflow-hidden rounded-lg py-0 md:max-w-none">
      <ServerAvatar
        server={server}
        className="h-auto min-h-32 w-32 self-stretch rounded-none"
        imageClassName="rounded-none"
        fallbackClassName="rounded-none text-3xl"
      />

      <div className="flex min-w-0 flex-col justify-center gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {t('servers.labels.current')}
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <div className="truncate text-lg font-semibold">{server.name}</div>
            {server.isDefaultServer && (
              <Badge
                variant="secondary"
                className="shrink-0 translate-y-0.5 uppercase"
              >
                {t('servers.labels.default')}
              </Badge>
            )}
          </div>
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {memberCount !== undefined &&
            (membersPath ? (
              <Link
                to={membersPath}
                className="hover:text-foreground flex items-center gap-1.5 hover:underline"
              >
                <MdPeople className="size-4" />
                {t('servers.labels.membersCount', { count: memberCount })}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5">
                <MdPeople className="size-4" />
                {t('servers.labels.membersCount', { count: memberCount })}
              </span>
            ))}
          <span className="flex items-center gap-1.5">
            <MdCalendarToday className="size-4" />
            {t('servers.labels.createdOn', {
              date: formatDate(String(server.createdAt)),
            })}
          </span>
        </div>
      </div>
    </Card>
  );
};
