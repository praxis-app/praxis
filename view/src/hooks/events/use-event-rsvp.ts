import { api } from '@/client/api-client';
import { getEventQueryKey } from '@/hooks/events/use-event-query';
import { getEventsQueryKey } from '@/hooks/events/use-events-query';
import {
  type EventDetailRes,
  type EventRes,
  type EventRsvpStatus,
} from '@/types/event.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const isEventsResponse = (data: unknown): data is { events: EventRes[] } =>
  typeof data === 'object' &&
  data !== null &&
  'events' in data &&
  Array.isArray(data.events);

export const useEventRsvp = (
  serverId: string | undefined,
  eventId: string | undefined,
) => {
  const queryClient = useQueryClient();
  const updateCaches = (event: EventDetailRes) => {
    queryClient.setQueryData(getEventQueryKey(serverId, eventId), { event });
    queryClient.setQueriesData(
      { queryKey: getEventsQueryKey(serverId) },
      (old: unknown) => {
        if (!isEventsResponse(old)) return old;
        return {
          events: old.events.map((item) =>
            item.id === event.id ? event : item,
          ),
        };
      },
    );
  };
  const mutation = useMutation({
    mutationFn: (status: EventRsvpStatus | null) => {
      if (!serverId || !eventId)
        throw new Error('Server and event IDs are required');
      return status
        ? api.updateEventRsvp(serverId, eventId, { status })
        : api.clearEventRsvp(serverId, eventId);
    },
    onSuccess: ({ event }) => updateCaches(event),
  });
  return mutation;
};
