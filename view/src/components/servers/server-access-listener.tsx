import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { useSubscription } from '@/hooks/use-subscription';
import { notificationPubSubTopic } from '@/lib/pub-sub.utils';
import { type PubSubMessage } from '@/types/shared.types';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface ServerAccessRevokedPayload {
  type: PubSubMessageType.SERVER_ACCESS_REVOKED;
  serverId: string;
}

export const ServerAccessListener = () => {
  const { me, isRegistered } = useAuthData();
  const { serverId } = useServerData();

  const { serverSlug } = useParams();
  const queryClient = useQueryClient();

  const enabled = isRegistered && !!me && !!serverId;

  useSubscription(enabled ? notificationPubSubTopic(serverId, me?.id) : '', {
    enabled,
    onMessage: (event) => {
      const { body }: PubSubMessage<ServerAccessRevokedPayload> = JSON.parse(
        event.data,
      );
      if (body?.type !== PubSubMessageType.SERVER_ACCESS_REVOKED) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: ['servers', serverSlug, 'access'],
      });
    },
  });

  return null;
};
