import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { useAuthData } from '@/hooks/use-auth-data';
import { ServerHomePage } from '@/pages/servers/server-home-page';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

export const ExplorePage = () => {
  const { isLoggedIn, isMeLoading, isRegistered } = useAuthData();
  const { isAppLoading } = useAppStore();

  const { data, error, isLoading } = useQuery({
    queryKey: ['servers', 'default'],
    queryFn: api.getDefaultServer,
    refetchOnMount: false,
    enabled: !isRegistered,
  });

  if (error) {
    throw error;
  }

  if (isAppLoading || (isLoggedIn && isMeLoading)) {
    return <ChannelSkeleton />;
  }

  // Signed in users land in the server they are currently viewing, matching
  // the "Open Praxis" entry point, rather than always the default server
  if (isRegistered) {
    return <ServerHomePage />;
  }

  const server = data?.server;

  if (isLoading || !server) {
    return <ChannelSkeleton />;
  }

  return <Navigate to={`/s/${server.slug}`} replace />;
};
