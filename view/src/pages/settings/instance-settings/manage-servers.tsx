import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ServerForm } from '@/components/servers/server-form';
import { ServerListItem } from '@/components/servers/server-list-item';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { handleError } from '@/lib/error.utils';
import { type ServerReq, type ServerRes } from '@/types/server.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ManageServers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServers = instanceAbility.can('manage', 'Server');

  const {
    data: serversData,
    error: serversError,
    isPending: isServersPending,
  } = useQuery({
    queryKey: ['servers'],
    queryFn: api.getServers,
    enabled: canManageServers && !isAbilityLoading,
  });

  const { mutateAsync: createServer, isPending: isCreatePending } = useMutation(
    {
      mutationFn: async ({
        values,
        image,
      }: {
        values: ServerReq;
        image?: File;
      }) => {
        const { server } = await api.createServer(values, image);

        queryClient.setQueryData<{ servers: ServerRes[] }>(
          ['servers'],
          (oldData) => {
            const existingServers = oldData?.servers ?? [];
            const normalizedServers = server.isDefaultServer
              ? existingServers.map((s) => ({
                  ...s,
                  isDefaultServer: false,
                }))
              : existingServers;

            return { servers: [server, ...normalizedServers] };
          },
        );

        if (server.isDefaultServer) {
          queryClient.setQueryData<{ server: ServerRes }>(
            ['servers', 'default'],
            { server },
          );
        }

        queryClient.invalidateQueries({ queryKey: ['me'] });

        return server;
      },
      onError(error: Error) {
        handleError(error);
      },
    },
  );

  if (isAbilityLoading) {
    return null;
  }

  if (!canManageServers) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('settings.headers.manageServers'),
          subheader: t('navigation.subheaders.instanceSettings'),
          subheaderAboveHeader: true,
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  if (!serversData || isServersPending) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('settings.headers.manageServers')}
        subheader={t('navigation.subheaders.instanceSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />

      <Container>
        <Card className="mb-4 pt-4 pb-7">
          <CardContent className="space-y-4 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t('servers.headers.create')}
              </h2>
            </div>

            <ServerForm
              isSubmitting={isCreatePending}
              onSubmit={(values, image) => createServer({ values, image })}
            />
          </CardContent>
        </Card>

        {serversData.servers.length > 0 && (
          <Card className="py-3">
            <CardContent className="flex flex-col gap-2 px-3">
              {serversData.servers.map((server) => (
                <ServerListItem key={server.id} server={server} />
              ))}
            </CardContent>
          </Card>
        )}

        {serversData.servers.length === 0 && (
          <p className="text-muted-foreground">{t('prompts.noContent')}</p>
        )}

        {serversError && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
