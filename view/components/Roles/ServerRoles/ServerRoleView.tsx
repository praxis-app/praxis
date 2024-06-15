import {
  Box,
  Card,
  Divider,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../../constants/shared.constants';
import { toastVar } from '../../../graphql/cache';
import { ServerRole } from '../../../graphql/gen';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import { useDeleteServerRoleMutation } from '../../../graphql/roles/mutations/gen/DeleteServerRole.gen';
import {
  ServerRolesDocument,
  ServerRolesQuery,
} from '../../../graphql/roles/queries/gen/ServerRoles.gen';
import {
  ViewServerRolesDocument,
  ViewServerRolesQuery,
} from '../../../graphql/roles/queries/gen/ViewServerRoles.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Flex from '../../Shared/Flex';
import ItemMenu from '../../Shared/ItemMenu';
import ServerPermissionView from './ServerPermissionView/ServerPermissionView';
import ServerRoleMembersView from './ServerRoleMembersView';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': { paddingBottom: 14 },
}));

interface Props {
  role: ServerRoleViewFragment;
  canManageRoles?: boolean;
  withCard?: boolean;
  isLast?: boolean;
}

const ServerRoleView = ({
  withCard = true,
  canManageRoles,
  isLast,
  role,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteRole] = useDeleteServerRoleMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const grantedPermissions = Object.entries(role.permissions).reduce<string[]>(
    (result, [key, value]) => {
      if (typeof value === 'boolean' && value) {
        result.push(key);
      }
      return result;
    },
    [],
  );
  const deniedPermissions = Object.entries(role.permissions).reduce<string[]>(
    (result, [key, value]) => {
      if (typeof value === 'boolean' && !value) {
        result.push(key);
      }
      return result;
    },
    [],
  );

  const handleDeleteBtnClick = async () =>
    await deleteRole({
      variables: { id: role.id },
      update(cache) {
        for (const query of [ServerRolesDocument, ViewServerRolesDocument]) {
          cache.updateQuery<ServerRolesQuery | ViewServerRolesQuery>(
            { query },
            (rolesData) =>
              produce(rolesData, (draft) => {
                if (!draft) {
                  return;
                }
                const index = draft.serverRoles.findIndex(
                  (r: ServerRole) => r.id === role.id,
                );
                draft.serverRoles.splice(index, 1);
              }),
          );
        }
        const cacheId = cache.identify(role);
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('errors.somethingWentWrong'),
        });
      },
    });

  const renderTitle = () => (
    <Flex
      gap="10px"
      alignItems="center"
      marginBottom={withCard ? 0 : 1.8}
      bgcolor={withCard ? 'none' : 'rgb(255, 255, 255, 0.05)'}
      paddingX={withCard ? 0 : 1.5}
      width="fit-content"
      borderRadius="8px"
    >
      <Box
        bgcolor={role.color}
        width="20px"
        height="20px"
        borderRadius={9999}
      />
      <Box fontSize={withCard ? 'inherit' : '28px'}>{role.name}</Box>
    </Flex>
  );

  const renderRole = () => (
    <>
      {grantedPermissions.length > 0 && (
        <>
          <Typography
            fontFamily="Inter Bold"
            marginBottom={0.75}
            textTransform="uppercase"
            fontSize={15}
          >
            {t('permissions.headers.grantedPermissions')}
          </Typography>
          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            flexWrap={isDesktop ? 'wrap' : 'nowrap'}
            gap={isDesktop ? '5px 22px' : 0.5}
            marginBottom={1.25}
          >
            {grantedPermissions.map((permission) => (
              <ServerPermissionView
                key={permission}
                permission={permission}
                enabled
              />
            ))}
          </Flex>
        </>
      )}

      {deniedPermissions.length > 0 && (
        <>
          <Typography
            fontFamily="Inter Bold"
            marginBottom={0.75}
            textTransform="uppercase"
            fontSize={15}
          >
            {t('permissions.headers.deniedPermissions')}
          </Typography>
          <Flex
            flexDirection={isDesktop ? 'row' : 'column'}
            flexWrap={isDesktop ? 'wrap' : 'nowrap'}
            gap={isDesktop ? '5px 22px' : 0.5}
            marginBottom={1.25}
          >
            {deniedPermissions.map((permission) => (
              <ServerPermissionView
                key={permission}
                permission={permission}
                enabled={false}
              />
            ))}
          </Flex>
        </>
      )}

      <ServerRoleMembersView
        header={t('roles.labels.roleMembers')}
        members={role.members}
      />
    </>
  );

  if (!withCard) {
    return (
      <Box marginBottom={3}>
        {renderTitle()}
        {renderRole()}

        {!isLast && <Divider sx={{ marginTop: 3 }} />}
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title={renderTitle()}
        action={
          <ItemMenu
            anchorEl={menuAnchorEl}
            setAnchorEl={setMenuAnchorEl}
            canUpdate={canManageRoles}
            canDelete={canManageRoles}
            deleteItem={handleDeleteBtnClick}
            deletePrompt={t('prompts.deleteItem', { itemType: 'role' })}
            editPath={`${NavigationPaths.Roles}/${role.id}/edit`}
          />
        }
      />
      <CardContent>
        <Divider sx={{ marginBottom: 2.4 }} />
        {renderRole()}
      </CardContent>
    </Card>
  );
};

export default ServerRoleView;
