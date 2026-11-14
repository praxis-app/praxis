import { api } from '@/client/api-client';
import { PubSubMessageType } from '@/constants/pub-sub.constants';
import { NavigationPaths } from '@/constants/shared.constants';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getAccountRevokedNotice,
  isAccountRevokedError,
} from '@/lib/auth-error.utils';
import { accountPubSubTopic } from '@/lib/pub-sub.utils';
import {
  getServerAccessNotice,
  isModeratedServerAccess,
} from '@/lib/server-access.utils';
import { t } from '@/lib/shared.utils';
import { useNoticesStore } from '@/store/notices.store';
import { type PubSubMessage } from '@/types/shared.types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AccountPayload =
  | {
      type: PubSubMessageType.SERVER_ACCESS_REVOKED;
      serverId: string;
      serverSlug: string;
    }
  | {
      type: PubSubMessageType.CALL_MODERATED;
      action: 'removed' | 'ended';
      callId: string;
      reason: string | null;
    };

export const useAccountAccess = (
  userId: string | undefined,
  meError: Error | null,
) => {
  const { addNotice, clearNotices } = useNoticesStore();

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
      addNotice(getServerAccessNotice(serverSlug, access));
    }
  };

  useSubscription(enabled ? accountPubSubTopic(userId) : '', {
    enabled,
    onMessage: (event) => {
      const { body }: PubSubMessage<AccountPayload> = JSON.parse(event.data);
      if (body?.type === PubSubMessageType.CALL_MODERATED) {
        const isEnded = body.action === 'ended';
        addNotice({
          id: `call:${body.callId}:${body.action}`,
          title: isEnded
            ? t('moderation.notices.callEndedTitle')
            : t('moderation.notices.removedFromCallTitle'),
          description: isEnded
            ? t('moderation.notices.callEndedDescription')
            : t('moderation.notices.removedFromCallDescription'),
          reason: body.reason,
          moderatedAt: null,
        });
      }
      if (body?.type === PubSubMessageType.SERVER_ACCESS_REVOKED) {
        handleServerAccessRevoked(body.serverSlug).catch(console.error);
      }
    },
  });

  useEffect(() => {
    if (!meError || !isAccountRevokedError(meError)) {
      return;
    }
    clearNotices();
    addNotice(getAccountRevokedNotice(meError));
    queryClient.clear();
    void navigate(NavigationPaths.Explore, { replace: true });
  }, [addNotice, clearNotices, meError, navigate, queryClient]);
};
