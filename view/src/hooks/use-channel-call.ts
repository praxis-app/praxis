import { api } from '@/client/api-client';
import { type CallJoinPreferences, type JoinCallRes } from '@/types/call.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const useChannelCall = (serverId?: string, channelId?: string) => {
  const [callConfig, setCallConfig] = useState<JoinCallRes | null>(null);
  const [callPreferences, setCallPreferences] =
    useState<CallJoinPreferences | null>(null);
  const [preJoinCallId, setPreJoinCallId] = useState<string | undefined>();
  const [isPreJoinOpen, setIsPreJoinOpen] = useState(false);
  const isLeavingRef = useRef(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: async ({
      callId,
    }: {
      callId?: string;
      preferences: CallJoinPreferences;
    }) => {
      if (!serverId || !channelId) {
        throw new Error('Server ID and channel ID are required');
      }

      if (callId) {
        return api.joinChannelCallById(serverId, channelId, callId);
      }

      return api.joinChannelCall(serverId, channelId);
    },
    onSuccess: (config, variables) => {
      isLeavingRef.current = false;
      setCallPreferences(variables.preferences);
      setCallConfig(config);
      setIsPreJoinOpen(false);
      setPreJoinCallId(undefined);
      void queryClient.invalidateQueries({
        queryKey: ['servers', serverId, 'channels', channelId, 'feed'],
      });
    },
    onError: (error) => {
      const isUnavailable =
        isAxiosError(error) && error.response?.status === 503;
      toast(
        isUnavailable
          ? t('calls.errors.unavailable')
          : t('calls.errors.joinFailed'),
        isUnavailable ? { id: 'calls-unavailable' } : undefined,
      );
    },
  });

  const leaveCall = async () => {
    if (isLeavingRef.current) {
      return;
    }

    isLeavingRef.current = true;
    const callId = callConfig?.call.id;
    setCallConfig(null);
    setCallPreferences(null);

    if (!serverId || !channelId || !callId) {
      return;
    }

    try {
      await api.leaveChannelCall(serverId, channelId, callId);
      void queryClient.invalidateQueries({
        queryKey: ['servers', serverId, 'channels', channelId, 'feed'],
      });
    } catch {
      // A failed best-effort leave should not trap the user inside the room
    } finally {
      isLeavingRef.current = false;
    }
  };

  return {
    callConfig,
    callPreferences,
    cancelPreJoin: () => {
      setIsPreJoinOpen(false);
      setPreJoinCallId(undefined);
    },
    confirmJoinCall: (preferences: CallJoinPreferences) =>
      joinMutation.mutate({ callId: preJoinCallId, preferences }),
    isJoining: joinMutation.isPending,
    isPreJoinOpen,
    joinCall: (callId?: string) => {
      setPreJoinCallId(callId);
      setIsPreJoinOpen(true);
    },
    leaveCall,
  };
};
