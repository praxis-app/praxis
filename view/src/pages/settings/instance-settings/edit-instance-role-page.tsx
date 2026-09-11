import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { InstanceRoleForm } from '@/components/roles/instance-roles/instance-role-form';
import { InstanceRoleMember } from '@/components/roles/instance-roles/instance-role-member';
import { InstanceRolePermissionsForm } from '@/components/roles/instance-roles/instance-role-permissions-form';
import { RoleMemberOption } from '@/components/roles/role-member-option';
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
import { handleError } from '@/lib/error.utils';
import { type InstanceRoleRes } from '@/types/role.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight, LuPlus } from 'react-icons/lu';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

enum EditInstanceRoleTabName {
  Permissions = 'permissions',
  Members = 'members',
}

export const EditInstanceRolePage = () => {
  const [activeTab, setActiveTab] = useState('display');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const { instanceRoleId } = useParams<{ instanceRoleId: string }>();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageInstanceRoles = instanceAbility.can('manage', 'InstanceRole');

  const {
    data: instanceRoleData,
    isPending: isInstanceRolePending,
    error: instanceRoleError,
  } = useQuery({
    queryKey: ['instance-roles', instanceRoleId],
    queryFn: () => {
      if (!instanceRoleId) {
        throw new Error('Instance role ID is required');
      }
      return api.getInstanceRole(instanceRoleId);
    },
    enabled: !!instanceRoleId && canManageInstanceRoles,
  });

  const { data: eligibleUsersData, error: eligibleUsersError } = useQuery({
    queryKey: ['instance-roles', instanceRoleId, 'members', 'eligible'],
    queryFn: () => {
      if (!instanceRoleId) {
        throw new Error('Instance role ID is required');
      }
      return api.getUsersEligibleForInstanceRole(instanceRoleId);
    },
    enabled:
      !!instanceRoleId && activeTab === 'members' && canManageInstanceRoles,
  });

  const { mutate: addMembers } = useMutation({
    mutationFn: async () => {
      if (!instanceRoleId || !instanceRoleData || !eligibleUsersData) {
        return;
      }
      await api.addInstanceRoleMembers(instanceRoleId, selectedUserIds);

      const membersToAdd = selectedUserIds.map(
        (id) => eligibleUsersData.users.find((u) => u.id === id)!,
      );
      queryClient.setQueryData(['instance-roles', instanceRoleId], {
        instanceRole: {
          ...instanceRoleData.instanceRole,
          members: instanceRoleData.instanceRole.members.concat(membersToAdd),
          memberCount:
            instanceRoleData.instanceRole.memberCount + membersToAdd.length,
        },
      });
      queryClient.setQueryData(
        ['instance-roles', instanceRoleId, 'members', 'eligible'],
        {
          users: eligibleUsersData?.users.filter(
            (user) => !selectedUserIds.includes(user.id),
          ),
        },
      );
      queryClient.setQueryData(
        ['instance-roles'],
        (oldData: { instanceRoles: InstanceRoleRes[] } | undefined) => {
          if (!oldData) {
            return { instanceRoles: [] };
          }
          return {
            instanceRoles: oldData.instanceRoles.map((role) => {
              if (role.id !== instanceRoleId) {
                return role;
              }
              return {
                ...role,
                memberCount: role.memberCount + membersToAdd.length,
              };
            }),
          };
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

  const { mutate: deleteInstanceRole, isPending: isDeletePending } =
    useMutation({
      mutationFn: async () => {
        if (!instanceRoleId) {
          return;
        }
        await api.deleteInstanceRole(instanceRoleId);

        queryClient.setQueryData<{ instanceRoles: InstanceRoleRes[] }>(
          ['instance-roles'],
          (oldData) => {
            if (!oldData) {
              return { instanceRoles: [] };
            }
            return {
              instanceRoles: oldData.instanceRoles.filter(
                (role) => role.id !== instanceRoleId,
              ),
            };
          },
        );
        queryClient.invalidateQueries({ queryKey: ['me'] });
      },
    });

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === EditInstanceRoleTabName.Permissions) {
      setActiveTab('permissions');
      return;
    }
    if (tabParam === EditInstanceRoleTabName.Members) {
      setActiveTab('members');
      return;
    }
    setActiveTab('display');
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'permissions') {
      setSearchParams({ tab: EditInstanceRoleTabName.Permissions });
      return;
    }
    if (value === 'members') {
      setSearchParams({ tab: EditInstanceRoleTabName.Members });
      return;
    }
    setSearchParams({});
  };

  const handleDeleteBtnClick = async () => {
    await navigate(NavigationPaths.Roles);
    deleteInstanceRole();
  };

  if (isAbilityLoading || isInstanceRolePending || isDeletePending) {
    return null;
  }

  if (!canManageInstanceRoles) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.instanceRoles'),
          subheader: t('navigation.subheaders.instanceRoles'),
          subheaderAboveHeader: true,
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  if (instanceRoleError || eligibleUsersError) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (!instanceRoleData) {
    return null;
  }

  return (
    <>
      <TopNav
        header={instanceRoleData.instanceRole.name}
        subheader={t('navigation.subheaders.instanceRoles')}
        subheaderAboveHeader
        onBackClick={() => navigate(NavigationPaths.Roles)}
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
            <InstanceRoleForm editRole={instanceRoleData.instanceRole} />

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
                  {instanceRoleData.instanceRole.name}
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
            <InstanceRolePermissionsForm
              instanceRole={instanceRoleData.instanceRole}
            />
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

            {!!instanceRoleData.instanceRole.members.length && (
              <Card className="py-5">
                <CardContent className="px-5">
                  {instanceRoleData.instanceRole.members.map((member) => (
                    <InstanceRoleMember
                      instanceRoleId={instanceRoleData.instanceRole.id}
                      instanceRoleMember={member}
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
