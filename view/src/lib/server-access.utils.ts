import { type ServerAccessRes } from '@/types/server.types';
import { t } from './shared.utils';

export const getServerAccessRedirectMessage = ({
  status,
  serverName,
}: ServerAccessRes) => {
  if (status === 'banned') {
    return t('servers.access.redirectedBanned', { serverName });
  }
  if (status === 'removed') {
    return t('servers.access.redirectedRemoved', { serverName });
  }
  return t('servers.access.redirectedNoAccess');
};
