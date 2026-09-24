import { type QueryClient } from '@tanstack/react-query';

export const invalidateServerMemberQueries = (
  queryClient: QueryClient,
  serverId: string,
) => {
  queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'members'] });
  queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'bans'] });
  queryClient.invalidateQueries({ queryKey: ['servers', serverId, 'roles'] });
};
