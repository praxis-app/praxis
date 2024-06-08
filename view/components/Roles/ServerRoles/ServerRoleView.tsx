import { Check, Close } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import { PermissionName, getPermissionText } from '../../../utils/role.utils';
import Flex from '../../Shared/Flex';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

interface Props {
  role: ServerRoleViewFragment;
}

const ServerRoleView = ({ role }: Props) => {
  const { t } = useTranslation();

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
        <Typography
          fontSize="18px"
          fontFamily="Inter Medium"
          marginBottom={0.5}
        >
          {t('permissions.headers.grantedPermissions')}
        </Typography>
        <Flex flexDirection="column" gap={0.5} marginBottom={1.25}>
          {grantedPermissions.map((permission) => {
            const { displayName } = getPermissionText(
              permission as PermissionName,
            );
            return (
              <Flex gap={1} key={permission}>
                <Check sx={{ color: '#50a561' }} /> {displayName}
              </Flex>
            );
          })}
        </Flex>

        {deniedPermissions.length > 0 && (
          <>
            <Typography
              fontSize="18px"
              fontFamily="Inter Medium"
              marginBottom={0.5}
            >
              {t('permissions.headers.deniedPermissions')}
            </Typography>
            <Flex flexDirection="column" gap={0.5} marginBottom={1}>
              {deniedPermissions.map((permission) => {
                const { displayName } = getPermissionText(
                  permission as PermissionName,
                );
                return (
                  <Flex gap={1} key={permission}>
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
