import { api } from '@/client/api-client';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatShortDate } from '@/lib/time.utils';
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
    <Card className="mb-4 h-32 flex-row gap-0 overflow-hidden rounded-lg py-0 md:max-w-none">
      <ServerAvatar
        server={server}
        className="size-32 shrink-0 rounded-none"
        imageClassName="rounded-none"
        fallbackClassName="rounded-none text-3xl"
      />

      <div className="flex min-w-0 flex-col justify-center gap-2 overflow-hidden px-5 py-3">
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

        <div className="text-muted-foreground flex min-w-0 flex-col gap-1 text-sm sm:flex-row sm:gap-x-4">
          {memberCount !== undefined &&
            (membersPath ? (
              <Link
                to={membersPath}
                className="hover:text-foreground flex min-w-0 items-center gap-1.5 hover:underline"
              >
                <MdPeople className="size-4 shrink-0" />
                <span className="truncate">
                  {t('servers.labels.membersCount', { count: memberCount })}
                </span>
              </Link>
            ) : (
              <span className="flex min-w-0 items-center gap-1.5">
                <MdPeople className="size-4 shrink-0" />
                <span className="truncate">
                  {t('servers.labels.membersCount', { count: memberCount })}
                </span>
              </span>
            ))}
          <span className="flex min-w-0 items-center gap-1.5">
            <MdCalendarToday className="size-4 shrink-0" />
            <span className="truncate">
              {t('servers.labels.createdOn', {
                date: formatShortDate(String(server.createdAt)),
              })}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
};
