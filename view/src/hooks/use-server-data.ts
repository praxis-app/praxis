import { api } from '@/client/api-client';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export const useServerData = () => {
  const { inviteToken, setInviteToken } = useAuthStore();

  const { serverSlug } = useParams();
  const navigate = useNavigate();

  const { me, isMeLoading, isMeSuccess, isMeError, isAuthError } = useAuthData({
    isMeQueryEnabled: !serverSlug,
  });

  const {
    data: serverBySlugData,
    isLoading: isServerBySlugLoading,
    error: serverBySlugError,
  } = useQuery({
    queryKey: ['servers', serverSlug],
    queryFn: async () => {
      if (!serverSlug) {
        throw new Error('Server slug is missing in URL');
      }
      try {
        return await api.getServerBySlug(serverSlug);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          navigate(NavigationPaths.Root);
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!serverSlug && isMeSuccess,
  });

  const {
    data: serverByInviteTokenData,
    isLoading: isServerByInviteTokenLoading,
  } = useQuery({
    queryKey: ['servers', 'invite', inviteToken],
    queryFn: async () => {
      if (!inviteToken) {
        throw new Error('Invite token is required');
      }
      try {
        const server = await api.getServerByInviteToken(inviteToken!);
        return server;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 400) {
          localStorage.removeItem(LocalStorageKeys.InviteToken);
          setInviteToken(null);
        }
        throw error;
      }
    },
    enabled: !!inviteToken,
  });

  const isDefaultServerQueryEnabled = () => {
    if (inviteToken) {
      return false;
    }
    if (isAuthError) {
      return true;
    }
    return (
      isAxiosError(serverBySlugError) &&
      serverBySlugError.response?.status === 401
    );
  };

  const { data: defaultServerData, isLoading: isDefaultServerLoading } =
    useQuery({
      queryKey: ['servers', 'default'],
      queryFn: api.getDefaultServer,
      enabled: isDefaultServerQueryEnabled(),
      refetchOnMount: false,
    });

  const server =
    serverBySlugData?.server ||
    serverByInviteTokenData?.server ||
    (!serverSlug ? me?.currentServer : undefined) ||
    defaultServerData?.server;

  const resolvedServerSlug = server?.slug || serverSlug;
  const resolvedServerPath = resolvedServerSlug
    ? `/s/${resolvedServerSlug}`
    : isAuthError
      ? NavigationPaths.Explore
      : NavigationPaths.Root;

  const isLoading =
    isMeLoading ||
    isDefaultServerLoading ||
    isServerBySlugLoading ||
    isServerByInviteTokenLoading;

  const currentUserHasNoServers =
    me?.serversCount === 0 && !isMeError && !isLoading;

  return {
    server,
    serverId: server?.id,
    serverSlug: resolvedServerSlug,
    serverPath: resolvedServerPath,
    myServerCount: me?.serversCount,
    generalChannelId: server?.generalChannelId,
    currentUserHasNoServers,
    isLoading,
  };
};
