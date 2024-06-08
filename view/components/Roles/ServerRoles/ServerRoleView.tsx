import { Check, Close } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent as MuiCardContent,
  Divider,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import { PermissionName, getPermissionText } from '../../../utils/role.utils';
import Flex from '../../Shared/Flex';
import { useIsDesktop } from '../../../hooks/shared.hooks';

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
}

const ServerRoleView = ({ role }: Props) => {
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

  return (
    <Card>
      <CardHeader
        title={
          <Flex gap="10px" alignItems="center">
            <Box
              bgcolor={role.color}
              width="20px"
              height="20px"
              borderRadius={9999}
            />
            <Box>{role.name}</Box>
          </Flex>
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
          gap={0.5}
          marginBottom={1.25}
        >
          {grantedPermissions.map((permission) => {
            const { displayName } = getPermissionText(
              permission as PermissionName,
            );
            return (
              <Flex
                gap={1}
                key={permission}
                width={isDesktop ? '240px' : '100%'}
              >
                <Check sx={{ color: '#50a561' }} /> {displayName}
              </Flex>
            );
          })}
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
              gap={0.5}
              marginBottom={1.25}
            >
              {deniedPermissions.map((permission) => {
                const { displayName } = getPermissionText(
                  permission as PermissionName,
                );
                return (
                  <Flex
                    gap={1}
                    key={permission}
                    width={isDesktop ? '240px' : '100%'}
                  >
                    <Close sx={{ color: '#e04f4a' }} /> {displayName}
                  </Flex>
                );
              })}
            </Flex>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerRoleView;
