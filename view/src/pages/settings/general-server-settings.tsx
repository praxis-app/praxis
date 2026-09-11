import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ServerForm } from '@/components/servers/server-form';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Form } from '@/components/ui/form';
import { AnonymousUsersEnabledField } from '@/components/settings/anonymous-users-enabled-field';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import {
  type ServerConfigReq,
  type ServerConfigRes,
} from '@/types/server-config.types';
import { type ServerReq, type ServerRes } from '@/types/server.types';
import { type CurrentUserRes } from '@/types/user.types';
import { serverConfigSchema } from '@/types/server-config.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

const mergeServerResponse = (
  cachedServer: ServerRes,
  updatedServer: ServerRes,
): ServerRes => ({
  ...cachedServer,
  ...updatedServer,
});

export const GeneralServerSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { server, serverId, serverPath, serverSlug } = useServerData();
  const { serverAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServerSettings = serverAbility.can('manage', 'ServerConfig');

  const { data, isPending, error } = useQuery({
    queryKey: ['servers', serverId, 'configs'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerConfig(serverId);
    },
    enabled: !!serverId && canManageServerSettings && !isAbilityLoading,
  });

  const form = useForm<zod.infer<typeof serverConfigSchema>>({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: {
      anonymousUsersEnabled: false,
    },
    values: {
      anonymousUsersEnabled: data?.serverConfig.anonymousUsersEnabled,
    },
    mode: 'onChange',
  });

  const { mutate: updateServerConfig, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (formData: ServerConfigReq) => {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        await api.updateServerConfig(serverId, formData);
        return formData;
      },
      onSuccess: (formData) => {
        queryClient.setQueryData<{ serverConfig: ServerConfigRes }>(
          ['servers', serverId, 'configs'],
          (oldData) => {
            if (!oldData) {
              throw new Error('Server config not found');
            }
            return {
              serverConfig: {
                ...oldData.serverConfig,
                ...formData,
                updatedAt: new Date(),
              },
            };
          },
        );
        form.reset(form.getValues());
      },
      onError: (error: Error) => {
        handleError(error);
      },
    });

  const {
    mutateAsync: updateServerIdentity,
    isPending: isIdentityUpdatePending,
  } = useMutation({
    mutationFn: async ({
      values,
      image,
    }: {
      values: ServerReq;
      image?: File;
    }) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const { server: updatedServer } = await api.updateServer(
        serverId,
        values,
        image,
      );
      return updatedServer;
    },
    onSuccess: (updatedServer) => {
      queryClient.setQueryData<{ server: ServerRes }>(
        ['servers', serverSlug],
        (oldData) =>
          oldData && {
            server: mergeServerResponse(oldData.server, updatedServer),
          },
      );
      queryClient.setQueryData<{ server: ServerRes }>(
        ['servers', serverId],
        (oldData) =>
          oldData && {
            server: mergeServerResponse(oldData.server, updatedServer),
          },
      );
      queryClient.setQueryData<{ servers: ServerRes[] }>(
        ['me', 'servers'],
        (oldData) =>
          oldData && {
            servers: oldData.servers.map((item) =>
              item.id === updatedServer.id
                ? mergeServerResponse(item, updatedServer)
                : item,
            ),
          },
      );
      queryClient.setQueryData<{ user: CurrentUserRes }>(
        ['me'],
        (oldData) =>
          oldData && {
            user: {
              ...oldData.user,
              currentServer:
                oldData.user.currentServer?.id === updatedServer.id
                  ? mergeServerResponse(
                      oldData.user.currentServer,
                      updatedServer,
                    )
                  : oldData.user.currentServer,
            },
          },
      );
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  if (isAbilityLoading) {
    return null;
  }

  if (!canManageServerSettings) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('navigation.labels.general'),
          subheader: t('navigation.subheaders.serverSettings'),
          subheaderAboveHeader: true,
          onBackClick: () =>
            navigate(`${serverPath}${NavigationPaths.Settings}`),
        }}
      />
    );
  }

  if (error) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (isPending || !data || !server) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.general')}
        subheader={t('navigation.subheaders.serverSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(`${serverPath}${NavigationPaths.Settings}`)}
      />

      <Container className="space-y-4">
        <Card>
          <CardContent className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">
                {t('servers.headers.profile')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('servers.descriptions.profile')}
              </p>
            </div>
            <ServerForm
              editServer={server}
              isSubmitting={isIdentityUpdatePending}
              showInstanceFields={false}
              onSubmit={(values, image) =>
                updateServerIdentity({ values, image })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                {t('servers.headers.access')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('servers.descriptions.access')}
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((formValues) =>
                  updateServerConfig({
                    anonymousUsersEnabled: formValues.anonymousUsersEnabled,
                  }),
                )}
                className="space-y-6"
              >
                <AnonymousUsersEnabledField
                  control={form.control}
                  name="anonymousUsersEnabled"
                />

                <div className="flex justify-end">
                  <Button
                    disabled={isUpdatePending || !form.formState.isDirty}
                    type="submit"
                    className="w-20"
                  >
                    {t('actions.save')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
