import { api } from '@/client/api-client';
import {
  isRemovableMessage,
  patchRemovedMessage,
} from '@/lib/moderation.utils';
import { type MessageRes } from '@/types/message.types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useModerationAccess } from './use-moderation-access';
import { useServerData } from './use-server-data';

interface Options {
  channelId?: string;
  callId?: string;
  forumPostId?: string;
}

export const useMessageRemoval = ({
  channelId,
  callId,
  forumPostId,
}: Options) => {
  const { serverId } = useServerData();
  const { canModerateContent } = useModerationAccess();
  const queryClient = useQueryClient();

  const removeMessage = useCallback(
    async (messageId: string, reason?: string) => {
      if (!serverId || !channelId) {
        throw new Error('Server ID and channel ID are required');
      }
      const data = { reason };
      const requestRemoval = async () => {
        if (forumPostId) {
          const { reply } = await api.removeForumReply(
            serverId,
            channelId,
            forumPostId,
            messageId,
            data,
          );
          return reply;
        }
        const { message } = callId
          ? await api.removeCallMessage(
              serverId,
              channelId,
              callId,
              messageId,
              data,
            )
          : await api.removeMessage(serverId, channelId, messageId, data);
        return message;
      };
      const removed = await requestRemoval();
      patchRemovedMessage(queryClient, serverId, channelId, removed);
    },
    [callId, channelId, forumPostId, queryClient, serverId],
  );

  return (message: MessageRes) =>
    canModerateContent && isRemovableMessage(message)
      ? (reason?: string) => removeMessage(message.id, reason)
      : undefined;
};
