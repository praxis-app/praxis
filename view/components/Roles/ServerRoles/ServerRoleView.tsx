import {
  Box,
  Card,
  Divider,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../../constants/shared.constants';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Flex from '../../Shared/Flex';
import ItemMenu from '../../Shared/ItemMenu';
import Link from '../../Shared/Link';
import ServerPermissionView from './ServerPermissionView/ServerPermissionView';
import ServerRoleMembersView from './ServerRoleMembersView';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 14,
  },
}));

interface Props {
  role: ServerRoleViewFragment;
  canManageRoles: boolean;
}

const ServerRoleView = ({ role, canManageRoles }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const editRolePath = `${NavigationPaths.Roles}/${role.id}/edit`;

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

  return (
    <Card>
      <CardHeader
        title={
          <Link
            href={canManageRoles ? editRolePath : '#'}
            sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            <Box
              bgcolor={role.color}
              width="20px"
              height="20px"
              borderRadius={9999}
            />
            <Box>{role.name}</Box>
          </Link>
        }
        action={
          <ItemMenu
            anchorEl={menuAnchorEl}
            editPath={editRolePath}
            setAnchorEl={setMenuAnchorEl}
            canUpdate={canManageRoles}
          />
        }
      />
      <CardContent>
        <Divider sx={{ marginBottom: 2.4 }} />

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
      </CardContent>
    </Card>
  );
};

export default ServerRoleView;
