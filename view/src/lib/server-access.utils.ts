import { type Notice } from '@/store/notices.store';
import { type ServerAccessRes } from '@/types/server.types';
import { t } from './shared.utils';

export const isModeratedServerAccess = ({ status }: ServerAccessRes) =>
  status === 'banned' || status === 'removed';

export const getServerAccessCopy = ({
  status,
  serverName,
}: ServerAccessRes) => {
  if (status === 'banned') {
    return {
      title: t('servers.access.bannedTitle', { serverName }),
      description: t('servers.access.bannedDescription'),
    };
  }
  if (status === 'removed') {
    return {
      title: t('servers.access.removedTitle', { serverName }),
      description: t('servers.access.removedDescription'),
    };
  }
  return {
    title: t('servers.access.noAccessTitle'),
    description: t('servers.access.noAccessDescription'),
  };
};

export const getServerAccessNotice = (
  serverSlug: string,
  access: ServerAccessRes,
): Notice => ({
  id: `server:${serverSlug}`,
  ...getServerAccessCopy(access),
  reason: access.reason,
  moderatedAt: access.moderatedAt,
});
