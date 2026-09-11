import { api } from '@/client/api-client';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { type CurrentUser } from '@/types/user.types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Mount once, from `AuthWrapper`. In `useServerData` this would fire one
// request per mounted consumer
export const useRecordServerVisit = () => {
  const queryClient = useQueryClient();

  const { server, isLoading } = useServerData();
  const { me, isMeSuccess } = useAuthData();

  const recordedVisit = useRef<string | null>(null);

  useEffect(() => {
    // Mid-load, `server` falls back to the stale cached default server
    if (!server || !isMeSuccess || isLoading) {
      return;
    }
    const visit = `${me?.id}:${server.id}`;
    if (recordedVisit.current === visit) {
      return;
    }
    recordedVisit.current = visit;

    // Best-effort: a failed write should not block viewing the server
    api.setCurrentServer(server.id).catch(() => {});
    queryClient.setQueryData<{ user: CurrentUser }>(['me'], (oldData) => {
      if (!oldData || oldData.user.currentServer?.id === server.id) {
        return oldData;
      }
      return { user: { ...oldData.user, currentServer: server } };
    });
  }, [queryClient, server, isMeSuccess, isLoading, me?.id]);
};
