import { LocalStorageKeys } from '@/constants/shared.constants';
import { getWebSocketURL } from '@/lib/shared.utils';
import { useAuthStore } from '@/store/auth.store';
import {
  type PubSubMessage,
  type SubscriptionOptions,
} from '@/types/shared.types';
import { useEffect, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';

const normalizeChannels = (channels: readonly string[]) =>
  [...new Set(channels.filter(Boolean))].sort();

const useSubscriptionInternal = (
  channels: readonly string[],
  options?: SubscriptionOptions,
) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isEnabled = options?.enabled ?? true;
  const channelsKey = JSON.stringify(normalizeChannels(channels));
  const normalizedChannels = useMemo(
    () => JSON.parse(channelsKey) as string[],
    [channelsKey],
  );

  const getOptions = () => {
    if (!options) {
      return options;
    }

    const webSocketOptions = { ...options };
    delete webSocketOptions.enabled;
    delete webSocketOptions.onSubscribed;

    const handleMessage = webSocketOptions.onMessage;
    const onMessage = (event: MessageEvent) => {
      const message: PubSubMessage = JSON.parse(event.data);
      if (!normalizedChannels.includes(message.channel)) {
        return;
      }
      if (message.type === 'RESPONSE' && message.error) {
        console.error(message.error);
        return;
      }
      if (message.type === 'RESPONSE' && message.request === 'SUBSCRIBE') {
        if (isEnabled) options.onSubscribed?.();
        return;
      }
      handleMessage?.(event);
    };
    return { ...webSocketOptions, onMessage };
  };

  const socketUrl = normalizedChannels.length > 0 ? getWebSocketURL() : null;
  const { sendMessage, readyState, ...rest } = useWebSocket(socketUrl, {
    share: true,
    shouldReconnect: () => isLoggedIn,
    onClose: (event) => {
      if (event.wasClean) {
        return;
      }
      console.warn('WebSocket connection closed', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        online: navigator.onLine,
        timestamp: new Date().toISOString(),
      });
    },
    onError: (event) => {
      console.error('WebSocket connection error', {
        timestamp: new Date().toISOString(),
        event,
      });
    },
    ...getOptions(),
  });

  useEffect(() => {
    const token = localStorage.getItem(LocalStorageKeys.AccessToken);
    if (!isLoggedIn || !token || !isEnabled || readyState !== WebSocket.OPEN) {
      return;
    }

    normalizedChannels.forEach((channel) => {
      const message: PubSubMessage = {
        type: 'REQUEST',
        request: 'SUBSCRIBE',
        channel,
        token,
      };
      sendMessage(JSON.stringify(message));
    });
  }, [isEnabled, isLoggedIn, normalizedChannels, readyState, sendMessage]);

  return { sendMessage, readyState, ...rest };
};

export const useSubscription = (
  channel: string,
  options?: SubscriptionOptions,
) => useSubscriptionInternal([channel], options);

export const useSubscriptions = (
  channels: readonly string[],
  options?: SubscriptionOptions,
) => useSubscriptionInternal(channels, options);
