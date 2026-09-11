import { api } from '@/client/api-client';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';

export const getEventQueryKey = (
  serverId: string | undefined,
  eventId: string | undefined,
  inviteToken: string | null = null,
) => ['servers', serverId, 'events', eventId, inviteToken];

export const useEventQuery = (
  serverId: string | undefined,
  eventId: string | undefined,
) => {
  const { inviteToken } = useAuthStore();

  return useQuery({
    queryKey: getEventQueryKey(serverId, eventId, inviteToken),
    queryFn: () => {
      if (!serverId || !eventId)
        throw new Error('Server and event IDs are required');
      return api.getEvent(serverId, eventId);
    },
    enabled: !!serverId && !!eventId,
  });
};
