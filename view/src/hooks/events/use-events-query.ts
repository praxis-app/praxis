import { api } from '@/client/api-client';
import { useAuthStore } from '@/store/auth.store';
import { type EventsQuery } from '@/types/event.types';
import { useQuery } from '@tanstack/react-query';

export const getEventsQueryKey = (
  serverId: string | undefined,
  inviteToken: string | null = null,
) => ['servers', serverId, 'events', inviteToken];

export const useEventsQuery = (
  serverId: string | undefined,
  query: EventsQuery,
) => {
  const { inviteToken } = useAuthStore();

  return useQuery({
    queryKey: [...getEventsQueryKey(serverId, inviteToken), query],
    queryFn: () => {
      if (!serverId) throw new Error('Server ID is required');
      return api.getEvents(serverId, query);
    },
    enabled: !!serverId,
  });
};
