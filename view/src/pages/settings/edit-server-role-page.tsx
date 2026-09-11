import { ServerRoleForm } from '@/components/roles/server-roles/server-role-form';
import { ServerRoleMember } from '@/components/roles/server-roles/server-role-member';
import { RoleMemberOption } from '@/components/roles/role-member-option';
import { ServerRolePermissionsForm } from '@/components/roles/server-roles/server-role-permissions-form';
import { DeleteButton } from '@/components/shared/delete-button';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Container } from '@/components/ui/container';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight, LuPlus } from 'react-icons/lu';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../client/api-client';
import { TopNav } from '../../components/nav/top-nav';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAbility } from '../../hooks/use-ability';
import { useServerData } from '../../hooks/use-server-data';
import { handleError } from '../../lib/error.utils';
import { type ServerRoleRes } from '../../types/role.types';

enum EditServerRoleTabName {
  Permissions = 'permissions',
  Members = 'members',
}

export const EditServerRolePage = () => {
  const [activeTab, setActiveTab] = useState('display');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { serverId, serverPath } = useServerData();
  const { serverRoleId } = useParams<{ serverRoleId: string }>();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { serverAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServerRoles = serverAbility.can('manage', 'ServerRole');

  const {
    data: serverRoleData,
    isPending: isServerRolePending,
    error: serverRoleError,
  } = useQuery({
    queryKey: ['servers', serverId, 'roles', serverRoleId],
    queryFn: () => {
      if (!serverRoleId || !serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerRole(serverId, serverRoleId);
    },
    enabled: !!serverRoleId && canManageServerRoles,
  });

  const { data: eligibleUsersData, error: eligibleUsersError } = useQuery({
    queryKey: [
      'servers',
      serverId,
      'roles',
      serverRoleId,
      'members',
      'eligible',
    ],
    queryFn: () => {
      if (!serverRoleId || !serverId) {
        throw new Error('Server ID is required');
      }
      return api.getUsersEligibleForServerRole(serverId, serverRoleId);
    },
    enabled: !!serverRoleId && activeTab === 'members' && canManageServerRoles,
  });

  const { mutate: addMembers } = useMutation({
    mutationFn: async () => {
      if (!serverRoleId || !serverRoleData || !eligibleUsersData || !serverId) {
        return;
      }
      await api.addServerRoleMembers(serverId, serverRoleId, selectedUserIds);

      const membersToAdd = selectedUserIds.map(
        (id) => eligibleUsersData.users.find((u) => u.id === id)!,
      );
      queryClient.setQueryData(['servers', serverId, 'roles', serverRoleId], {
        serverRole: {
          ...serverRoleData.serverRole,
          members: serverRoleData.serverRole.members.concat(membersToAdd),
        },
      });
      queryClient.setQueryData(
        ['servers', serverId, 'roles', serverRoleId, 'members', 'eligible'],
        {
          users: eligibleUsersData?.users.filter(
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

  const { mutate: deleteServerRole, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      if (!serverRoleId || !serverId) {
        return;
      }
      await api.deleteServerRole(serverId, serverRoleId);

      queryClient.setQueryData<{ serverRoles: ServerRoleRes[] }>(
        ['servers', serverId, 'roles'],
        (oldData) => {
          if (!oldData) {
            return { serverRoles: [] };
          }
          return {
            serverRoles: oldData.serverRoles.filter(
              (role) => role.id !== serverRoleId,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === EditServerRoleTabName.Permissions) {
      setActiveTab('permissions');
      return;
    }
    if (tabParam === EditServerRoleTabName.Members) {
      setActiveTab('members');
      return;
    }
    setActiveTab('display');
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'permissions') {
      setSearchParams({ tab: EditServerRoleTabName.Permissions });
      return;
    }
    if (value === 'members') {
      setSearchParams({ tab: EditServerRoleTabName.Members });
      return;
    }
    setSearchParams({});
  };

  const handleDeleteBtnClick = async () => {
    await navigate(`${serverPath}${NavigationPaths.Roles}`);
    deleteServerRole();
  };

  if (isAbilityLoading || isServerRolePending || isDeletePending) {
    return null;
  }

  if (!canManageServerRoles) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.serverRoles'),
          subheader: t('navigation.subheaders.serverSettings'),
          subheaderAboveHeader: true,
          onBackClick: () =>
            navigate(`${serverPath}${NavigationPaths.Settings}`),
        }}
      />
    );
  }

  if (serverRoleError || eligibleUsersError) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  return (
    <>
      <TopNav
        header={serverRoleData.serverRole.name}
        subheader={t('navigation.subheaders.serverSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(`${serverPath}${NavigationPaths.Roles}`)}
      />

      <Container>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4 h-10 w-full">
            <TabsTrigger value="display">{t('roles.tabs.display')}</TabsTrigger>
            <TabsTrigger value="permissions">
              {t('roles.tabs.permissions')}
            </TabsTrigger>
            <TabsTrigger value="members">{t('roles.tabs.members')}</TabsTrigger>
          </TabsList>

          <TabsContent value="display">
            <ServerRoleForm editRole={serverRoleData.serverRole} />

            <DeleteButton onClick={() => setIsConfirmDialogOpen(true)}>
              {t('roles.actions.delete')}
            </DeleteButton>

            <Dialog
              open={isConfirmDialogOpen}
              onOpenChange={() => setIsConfirmDialogOpen(false)}
            >
              <DialogContent>
                <DialogHeader className="pt-6">
                  <DialogTitle>
                    {t('prompts.deleteItem', { itemType: 'role' })}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {serverRoleData.serverRole.name}
                </DialogDescription>

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

          <TabsContent value="permissions">
            <ServerRolePermissionsForm serverRole={serverRoleData.serverRole} />
          </TabsContent>

          <TabsContent value="members">
            <Card
              className="mb-3 cursor-pointer"
              onClick={() => setIsAddMemberDialogOpen(true)}
            >
              <CardContent className="flex items-center justify-between py-0.5">
                <div className="flex items-center">
                  <LuPlus className="mr-3 size-6" />
                  <span>{t('roles.actions.addMembers')}</span>
                </div>
                <LuChevronRight className="size-6" />
              </CardContent>
            </Card>

            {!!serverRoleData.serverRole.members.length && (
              <Card className="py-5">
                <CardContent className="px-5">
                  {serverRoleData.serverRole.members.map((member) => (
                    <ServerRoleMember
                      serverRoleId={serverRoleData.serverRole.id}
                      serverRoleMember={member}
                      key={member.id}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            <Dialog
              open={isAddMemberDialogOpen}
              onOpenChange={() => setIsAddMemberDialogOpen(false)}
            >
              <DialogContent className="overflow-y-auto pt-10 md:max-h-[90vh] md:min-w-xl">
                <DialogHeader>
                  <DialogTitle>{t('roles.actions.addMembers')}</DialogTitle>
                  <VisuallyHidden>
                    <DialogDescription>
                      {t('roles.descriptions.addMembers')}
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
                  <Button onClick={() => addMembers()} className="w-18">
                    {t('roles.actions.add')}
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
