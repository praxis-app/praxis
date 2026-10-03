import { api } from '@/client/api-client';
import { useMeQuery } from '@/hooks/use-me-query';
import { getServerAccessRedirectMessage } from '@/lib/server-access.utils';
import { useAuthStore } from '@/store/auth.store';
import { type InstanceAbility } from '@/types/role.types';
import { createMongoAbility } from '@casl/ability';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ServerAccessDenied } from './server-access-denied';
import { ServerAccessListener } from './server-access-listener';

const SERVER_ACCESS_REDIRECT_TOAST_ID = 'server-access-redirect';

export const ServerAccessGuard = () => {
  const { isLoggedIn, inviteToken } = useAuthStore();

  const { serverSlug } = useParams();
  const queryClient = useQueryClient();

  const { data: meData } = useMeQuery({ enabled: isLoggedIn });

  const { data: accessData } = useQuery({
    queryKey: ['servers', serverSlug, 'access'],
    queryFn: () => {
      if (!serverSlug) {
        throw new Error('Server slug is required');
      }
      return api.getServerAccess(serverSlug);
    },
    enabled: isLoggedIn && !!serverSlug && !inviteToken,
  });

  const access = accessData?.access;
  const instanceAbility = createMongoAbility<InstanceAbility>(
    meData?.user.permissions.instance ?? [],
  );
  const isDenied =
    !!access &&
    access.status !== 'member' &&
    !instanceAbility.can('manage', 'Server');

  const { data: myServersData } = useQuery({
    queryKey: ['me', 'servers'],
    queryFn: api.getCurrentUserServers,
    enabled: isDenied,
  });

  const fallbackServer = myServersData?.servers.find(
    (server) => server.slug !== serverSlug,
  );

  useEffect(() => {
    if (!isDenied || !access || !fallbackServer) {
      return;
    }
    toast(getServerAccessRedirectMessage(access), {
      id: SERVER_ACCESS_REDIRECT_TOAST_ID,
      description: access.reason ?? undefined,
    });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  }, [isDenied, access, fallbackServer, queryClient]);

  if (!isDenied) {
    return (
      <>
        <ServerAccessListener />
        <Outlet />
      </>
    );
  }
  if (fallbackServer) {
    return <Navigate to={`/s/${fallbackServer.slug}`} replace />;
  }
  if (!myServersData) {
    return null;
  }
  return <ServerAccessDenied access={access} />;
};
