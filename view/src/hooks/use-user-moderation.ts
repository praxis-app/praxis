import { api } from '@/client/api-client';
import { useQuery } from '@tanstack/react-query';
import { useModerationAccess } from './use-moderation-access';
import { useServerData } from './use-server-data';

export const useUserModeration = (userId: string) => {
  const { serverId } = useServerData();
  const { canManageServerMembers, canSuspendUsers, canDeleteUsers } =
    useModerationAccess();

  const { data } = useQuery({
    queryKey: ['users', userId, 'moderation', serverId],
    queryFn: () => api.getUserModeration(userId, serverId),
    enabled:
      (!!serverId && canManageServerMembers) ||
      canSuspendUsers ||
      canDeleteUsers,
  });

  return {
    serverId,
    account: data?.moderation.account,
    server: data?.moderation.server,
  };
};
