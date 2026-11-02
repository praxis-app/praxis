import { api } from '@/client/api-client';
import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { NavigationPaths } from '@/constants/shared.constants';
import { useSubscription } from '@/hooks/use-subscription';
import {
  dismissAccountRevokedNotice,
  isAccountRevokedError,
} from '@/lib/auth-error.utils';
import { accountPubSubTopic } from '@/lib/pub-sub.utils';
import { isModeratedServerAccess } from '@/lib/server-access.utils';
import { useServerAccessStore } from '@/store/server-access.store';
import { type PubSubMessage } from '@/types/shared.types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServerAccessRevokedPayload {
  type: PubSubMessageType.SERVER_ACCESS_REVOKED;
  serverId: string;
  serverSlug: string;
}

export const useAccountAccess = (
  userId: string | undefined,
  meError: Error | null,
) => {
  const { addNotice, clearNotices } = useServerAccessStore();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const enabled = !!userId;

  const handleServerAccessRevoked = async (serverSlug: string) => {
    const { access } = await queryClient.fetchQuery({
      queryKey: ['servers', serverSlug, 'access'],
      queryFn: () => api.getServerAccess(serverSlug),
    });
    void queryClient.invalidateQueries({ queryKey: ['me'] });
    if (isModeratedServerAccess(access)) {
      addNotice({ serverSlug, access });
    }
  };

  useSubscription(enabled ? accountPubSubTopic(userId) : '', {
    enabled,
    onMessage: (event) => {
      const { body }: PubSubMessage<ServerAccessRevokedPayload> = JSON.parse(
        event.data,
      );
      if (body?.type !== PubSubMessageType.SERVER_ACCESS_REVOKED) {
        return;
      }
      handleServerAccessRevoked(body.serverSlug).catch(console.error);
    },
  });

  useEffect(() => {
    if (userId) {
      dismissAccountRevokedNotice();
    }
  }, [userId]);

  useEffect(() => {
    if (!meError || !isAccountRevokedError(meError)) {
      return;
    }
    clearNotices();
    queryClient.clear();
    void navigate(NavigationPaths.Explore, { replace: true });
  }, [clearNotices, meError, navigate, queryClient]);
};
