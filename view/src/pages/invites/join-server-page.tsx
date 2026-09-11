import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { TopNav } from '@/components/nav/top-nav';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { handleError } from '@/lib/error.utils';
import { useAuthStore } from '@/store/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export const JoinServerPage = () => {
  const { setInviteToken } = useAuthStore();
  const { isLoggedIn, isMeError } = useAuthData();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { token } = useParams();
  const { t } = useTranslation();

  const {
    data: isValidInviteData,
    error: isValidInviteError,
    isLoading: isValidInviteLoading,
  } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      const { isValidInvite } = await api.isValidInvite(token);
      if (!isValidInvite) {
        throw new Error('Invalid invite');
      }
      setInviteToken(token);

      return isValidInvite;
    },
    enabled: !!token && isLoggedIn,
  });

  const {
    data: serverData,
    error: serverError,
    isLoading: isServerLoading,
  } = useQuery({
    queryKey: ['servers', 'invite', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      return api.getServerByInviteToken(token);
    },
    enabled: !!token && isLoggedIn && !!isValidInviteData,
  });

  const {
    data: currentUserServersData,
    error: currentUserServersError,
    isLoading: isCurrentUserServersLoading,
  } = useQuery({
    queryKey: ['me', 'servers'],
    queryFn: api.getCurrentUserServers,
    enabled: !!token && isLoggedIn && !!isValidInviteData,
  });

  const isAlreadyMember = currentUserServersData?.servers.some(
    (server) => server.id === serverData?.server.id,
  );

  useEffect(() => {
    if (!isAlreadyMember || !serverData?.server) {
      return;
    }

    localStorage.removeItem(LocalStorageKeys.InviteToken);
    setInviteToken(null);
    navigate(`/s/${serverData.server.slug}`, { replace: true });
  }, [isAlreadyMember, navigate, serverData?.server, setInviteToken]);

  const { mutateAsync: joinServer, isPending: isJoinServerPending } =
    useMutation({
      mutationFn: async () => {
        if (!token || !serverData?.server) {
          throw new Error('Missing invite token or server data');
        }
        await api.joinServer(serverData.server.id, token);
        return serverData.server.slug;
      },
      onSuccess: (serverSlug) => {
        localStorage.removeItem(LocalStorageKeys.InviteToken);
        setInviteToken(null);
        queryClient.invalidateQueries({ queryKey: ['me'] });
        navigate(`/s/${serverSlug}`);
      },
      onError: (error: Error) => {
        handleError(error);
      },
    });

  if (isMeError) {
    return <Navigate to={NavigationPaths.Root} />;
  }

  if (isValidInviteError || serverError || !token) {
    return (
      <>
        <TopNav />
        <Container>
          <Card>
            <CardContent className="p-6">
              <p className="text-center">
                {t('invites.prompts.expiredOrInvalid')}
              </p>
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }

  if (currentUserServersError) {
    throw currentUserServersError;
  }

  if (
    isValidInviteLoading ||
    isServerLoading ||
    isCurrentUserServersLoading ||
    !isValidInviteData ||
    !serverData ||
    !currentUserServersData ||
    isAlreadyMember
  ) {
    return <ChannelSkeleton />;
  }

  return (
    <>
      <TopNav
        header={t('invites.headers.invitedToJoin', {
          serverName: serverData.server.name,
        })}
      />

      <Container>
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                {t('invites.prompts.youHaveBeenInvited')}
              </h1>
              <p className="text-muted-foreground">
                {t('invites.prompts.joinServerToStart')}
              </p>
            </div>

            <Separator />

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <ServerAvatar
                  server={serverData.server}
                  className="size-10 shrink-0"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <h2 className="text-xl font-semibold">
                    {serverData.server.name}
                  </h2>
                  {serverData.server.memberCount !== undefined && (
                    <p className="text-muted-foreground text-base">
                      {t('roles.labels.membersCount', {
                        count: serverData.server.memberCount,
                      })}
                    </p>
                  )}
                  {serverData.server.description && (
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {serverData.server.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="pt-1">
              <Button
                onClick={() => joinServer()}
                disabled={isJoinServerPending}
                className="w-full"
              >
                {t('invites.actions.acceptInvite')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
