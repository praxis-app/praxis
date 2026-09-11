import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { RoleMemberOption } from '@/components/roles/role-member-option';
import { ServerForm } from '@/components/servers/server-form';
import { ServerMember } from '@/components/servers/server-member';
import { DeleteButton } from '@/components/shared/delete-button';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { type ServerReq, type ServerRes } from '@/types/server.types';
import { type CurrentUserRes, type UserRes } from '@/types/user.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowRight, LuChevronRight, LuPlus } from 'react-icons/lu';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const mergeServerResponse = (
  cachedServer: ServerRes,
  updatedServer: ServerRes,
): ServerRes => ({
  ...cachedServer,
  ...updatedServer,
});

enum EditServerTabName {
  Properties = 'properties',
  Members = 'members',
}

export const EditServerPage = () => {
  const [activeTab, setActiveTab] = useState(EditServerTabName.Properties);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const { serverId } = useParams<{ serverId: string }>();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { server: currentServer } = useServerData();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServers = instanceAbility.can('manage', 'Server');

  const {
    data: serverData,
    isLoading: isServerLoading,
    error: serverError,
  } = useQuery({
    queryKey: ['servers', serverId],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerById(serverId);
    },
    enabled: canManageServers && !isAbilityLoading && !!serverId,
  });

  const serverMemberQueriesEnabled =
    activeTab === EditServerTabName.Members &&
    !isAbilityLoading &&
    canManageServers &&
    !!serverId;

  const {
    data: serverMembersData,
    isLoading: isServerMembersLoading,
    error: serverMembersError,
  } = useQuery({
    queryKey: ['servers', serverId, 'members'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerMembers(serverId);
    },
    enabled: serverMemberQueriesEnabled,
  });

  const { data: eligibleUsersData, error: eligibleUsersError } = useQuery({
    queryKey: ['servers', serverId, 'members', 'eligible'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getUsersEligibleForServer(serverId);
    },
    enabled: serverMemberQueriesEnabled,
  });

  const { mutateAsync: updateServer, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async ({
        values,
        image,
      }: {
        values: ServerReq;
        image?: File;
      }) => {
        if (!serverId || !serverData?.server) {
          throw new Error('Server ID and server data are required');
        }

        const wasDefaultServer = serverData.server.isDefaultServer;
        const previousSlug = serverData.server.slug;
        const updateResponse = await api.updateServer(serverId, values, image);
        const { server: updatedServer } = updateResponse;

        queryClient.setQueryData<{ server: ServerRes }>(
          ['servers', serverId],
          (oldData) =>
            oldData && {
              server: mergeServerResponse(oldData.server, updatedServer),
            },
        );

        queryClient.setQueryData<{ servers: ServerRes[] }>(
          ['servers'],
          (oldData) => {
            if (!oldData) {
              return oldData;
            }

            return {
              servers: oldData.servers.map((server) => {
                if (server.id === updatedServer.id) {
                  return mergeServerResponse(server, updatedServer);
                }

                if (updatedServer.isDefaultServer) {
                  return { ...server, isDefaultServer: false };
                }

                return server;
              }),
            };
          },
        );

        if (updatedServer.isDefaultServer) {
          queryClient.setQueryData<{ server: ServerRes }>(
            ['servers', 'default'],
            (oldData) =>
              oldData
                ? {
                    server: mergeServerResponse(oldData.server, updatedServer),
                  }
                : { server: updatedServer },
          );
        } else if (wasDefaultServer) {
          queryClient.invalidateQueries({ queryKey: ['servers', 'default'] });
        }

        if (previousSlug !== updatedServer.slug) {
          queryClient.removeQueries({
            queryKey: ['servers', previousSlug],
            exact: true,
          });
        }
        queryClient.setQueryData<{ server: ServerRes }>(
          ['servers', updatedServer.slug],
          (oldData) =>
            oldData && {
              server: mergeServerResponse(oldData.server, updatedServer),
            },
        );
        queryClient.setQueryData<{ servers: ServerRes[] }>(
          ['me', 'servers'],
          (oldData) =>
            oldData && {
              servers: oldData.servers.map((server) =>
                server.id === updatedServer.id
                  ? mergeServerResponse(server, updatedServer)
                  : server,
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

        return updatedServer;
      },
      onError(error: Error) {
        handleError(error);
      },
    },
  );

  const { mutate: deleteServer, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      if (!serverId) {
        return;
      }
      // Route to manage servers optimistically to avoid 404 error
      await navigate(NavigationPaths.ManageServers);
      await api.deleteServer(serverId);
    },
    onSuccess() {
      queryClient.setQueryData<{ servers: ServerRes[] }>(
        ['servers'],
        (oldData) => {
          if (!oldData) {
            return { servers: [] };
          }
          return {
            servers: oldData.servers.filter((s) => s.id !== serverId),
          };
        },
      );
      queryClient.removeQueries({ queryKey: ['servers', serverId] });
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const { mutate: addMembers } = useMutation({
    mutationFn: async () => {
      if (!serverId || !eligibleUsersData) {
        return;
      }

      await api.addServerMembers(serverId, selectedUserIds);

      const membersToAdd = selectedUserIds
        .map((id) => eligibleUsersData.users.find((user) => user.id === id))
        .filter(Boolean) as UserRes[];

      queryClient.setQueryData<{ users: UserRes[] } | undefined>(
        ['servers', serverId, 'members'],
        (oldData) => {
          if (!oldData) {
            return { users: membersToAdd };
          }

          return { users: [...oldData.users, ...membersToAdd] };
        },
      );

      queryClient.setQueryData<{ users: UserRes[] } | undefined>(
        ['servers', serverId, 'members', 'eligible'],
        {
          users: eligibleUsersData.users.filter(
            (user) => !selectedUserIds.includes(user.id),
          ),
        },
      );

      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSelectedUserIds([]);
      setIsAddMemberDialogOpen(false);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === EditServerTabName.Members) {
      setActiveTab(EditServerTabName.Members);
      return;
    }
    setActiveTab(EditServerTabName.Properties);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as EditServerTabName);
    if (value === EditServerTabName.Members) {
      setSearchParams({ tab: EditServerTabName.Members });
      return;
    }
    setSearchParams({});
  };

  const handleDeleteBtnClick = async () => {
    setIsConfirmDialogOpen(false);
    deleteServer();
  };

  const handleSwitchToServer = async () => {
    if (!serverData?.server) {
      return;
    }

    try {
      const { server } = await queryClient.fetchQuery({
        queryKey: ['servers', serverData.server.slug],
        queryFn: () => api.getServerBySlug(serverData.server.slug),
      });
      navigate(`/s/${server.slug}`);
    } catch (error) {
      handleError(error as Error);
    }
  };

  if (isAbilityLoading || isServerLoading || isServerMembersLoading) {
    return null;
  }

  if (!canManageServers) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('servers.headers.edit'),
          subheader: t('navigation.subheaders.manageServers'),
          subheaderAboveHeader: true,
          onBackClick: () => navigate(NavigationPaths.ManageServers),
        }}
      />
    );
  }

  if (serverError || serverMembersError || eligibleUsersError) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (!serverData?.server) {
    return null;
  }

  return (
    <>
      <TopNav
        header={serverData.server.name}
        subheader={t('navigation.subheaders.manageServers')}
        subheaderAboveHeader
        onBackClick={() => navigate(NavigationPaths.ManageServers)}
      />

      <Container>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4 h-10 w-full">
            <TabsTrigger value={EditServerTabName.Properties}>
              {t('servers.tabs.properties')}
            </TabsTrigger>
            <TabsTrigger value={EditServerTabName.Members}>
              {t('servers.tabs.members')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={EditServerTabName.Properties}>
            <Card className="mb-1 pb-1.5">
              <CardContent>
                <ServerForm
                  className="pb-6"
                  editServer={serverData.server}
                  isSubmitting={isUpdatePending}
                  onSubmit={(values, image) => updateServer({ values, image })}
                />
              </CardContent>
            </Card>

            {currentServer?.id !== serverData.server.id && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => void handleSwitchToServer()}
              >
                {t('servers.actions.switchTo')}
                <LuArrowRight />
              </Button>
            )}

            <DeleteButton
              className="mt-2"
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={serverData.server.isDefaultServer}
            >
              {t('servers.actions.deleteServer')}
            </DeleteButton>

            <Dialog
              open={isConfirmDialogOpen}
              onOpenChange={() => setIsConfirmDialogOpen(false)}
            >
              <DialogContent>
                <DialogHeader className="pt-6">
                  <DialogTitle>
                    {t('prompts.deleteItem', { itemType: 'server' })}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>{serverData.server.name}</DialogDescription>

                <DialogFooter className="flex flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmDialogOpen(false)}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBtnClick}
                    disabled={isDeletePending}
                  >
                    {t('actions.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value={EditServerTabName.Members}>
            <Card
              className="mb-3 cursor-pointer"
              onClick={() => setIsAddMemberDialogOpen(true)}
            >
              <CardContent className="flex items-center justify-between py-0.5">
                <div className="flex items-center">
                  <LuPlus className="mr-3 size-6" />
                  <span>{t('servers.actions.addMembers')}</span>
                </div>
                <LuChevronRight className="size-6" />
              </CardContent>
            </Card>

            {!!serverMembersData?.users.length && (
              <Card className="py-5">
                <CardContent className="px-5">
                  {serverMembersData.users.map((member) => (
                    <ServerMember
                      serverId={serverId!}
                      member={member}
                      key={member.id}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {serverMembersData && serverMembersData.users.length === 0 && (
              <p className="text-muted-foreground">{t('prompts.noContent')}</p>
            )}

            <Dialog
              open={isAddMemberDialogOpen}
              onOpenChange={() => setIsAddMemberDialogOpen(false)}
            >
              <DialogContent className="overflow-y-auto pt-10 md:max-h-[90vh] md:min-w-xl">
                <DialogHeader>
                  <DialogTitle>{t('servers.actions.addMembers')}</DialogTitle>
                  <VisuallyHidden>
                    <DialogDescription>
                      {t('servers.descriptions.addMembers')}
                    </DialogDescription>
                  </VisuallyHidden>
                </DialogHeader>
                <div className="space-y-0.5">
                  {eligibleUsersData?.users.map((user) => (
                    <RoleMemberOption
                      key={user.id}
                      selectedUserIds={selectedUserIds}
                      setSelectedUserIds={setSelectedUserIds}
                      className="px-3.5"
                      user={user}
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => addMembers()}
                    className="w-30"
                    disabled={!selectedUserIds.length}
                  >
                    {t('servers.actions.addMembers')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
};
