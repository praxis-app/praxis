import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client/api-client';
import { handleError } from '../lib/error.utils';
import { type InviteRes } from '../types/invite.types';
import { useServerData } from './use-server-data';

export const useDeleteInviteMutation = (inviteId: string) => {
  const queryClient = useQueryClient();
  const { serverId } = useServerData();

  return useMutation({
    mutationFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.deleteInvite(serverId, inviteId);

      queryClient.setQueryData<{ invites: InviteRes[] }>(
        ['servers', serverId, 'invites'],
        (oldData) => {
          if (!oldData) {
            return { invites: [] };
          }
          return {
            invites: oldData.invites.filter((invite) => invite.id !== inviteId),
          };
        },
      );
    },
    onError(error: Error) {
      handleError(error);
    },
  });
};
