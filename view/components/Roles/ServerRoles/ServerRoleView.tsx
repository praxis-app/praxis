import {
  Box,
  Card,
  Divider,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import { TruncationSizes } from '../../../constants/shared.constants';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import { getUserProfilePath } from '../../../utils/user.utils';
import Flex from '../../Shared/Flex';
import Link from '../../Shared/Link';
import UserAvatar from '../../Users/UserAvatar';
import ServerPermissionView from './ServerPermissionView';

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
              gap={0.5}
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

        {role.members.length > 0 && (
          <>
            <Typography
              fontFamily="Inter Bold"
              marginBottom={1.2}
              textTransform="uppercase"
              fontSize={15}
            >
              {t('roles.labels.roleMembers')}
            </Typography>

            <Flex
              flexDirection={isDesktop ? 'row' : 'column'}
              flexWrap={isDesktop ? 'wrap' : 'nowrap'}
              gap={isDesktop ? 1.6 : 1.4}
              marginBottom={1.25}
              paddingLeft={isDesktop ? 0.1 : 0.5}
            >
              {role.members.map((member) => {
                const username = member.displayName || member.name;
                const truncatedUsername = truncate(username, {
                  length: isDesktop
                    ? TruncationSizes.Small
                    : TruncationSizes.Medium,
                });
                const userPath = getUserProfilePath(member.name);

                return (
                  <Link
                    key={member.id}
                    href={userPath}
                    sx={{
                      width: isDesktop ? '235px' : '100%',
                      display: 'flex',
                      gap: 1.3,
                    }}
                  >
                    <UserAvatar user={member} size={25} />
                    {truncatedUsername}
                  </Link>
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
