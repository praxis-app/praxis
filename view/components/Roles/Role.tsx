import { ArrowForwardIos, Person } from '@mui/icons-material';
import {
  Avatar,
  Box,
  CardActionArea,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../constants/shared.constants';
import { GroupRoleFragment } from '../../graphql/groups/fragments/gen/GroupRole.gen';
import { ServerRoleFragment } from '../../graphql/roles/fragments/gen/ServerRole.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getGroupPath } from '../../utils/group.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';

interface Props {
  gutterBottom?: boolean;
  role: GroupRoleFragment | ServerRoleFragment;
}

const Role = ({ role, gutterBottom }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const { id, name, color, memberCount } = role;
  const groupPath = 'group' in role ? getGroupPath(role.group.name) : '';
  const editRolePath = `${groupPath}${NavigationPaths.Roles}/${id}/edit`;

  const actionAreaStyles = {
    borderRadius: 2,
    paddingLeft: 0.75,
    paddingRight: 0.25,
    paddingY: 0.75,
  };
  const avatarStyes = {
    backgroundColor: color,
    color: 'black',
    marginRight: 1.5,
  };
  const memberIconStyles = {
    fontSize: 18,
    marginBottom: -0.5,
    marginRight: 0.35,
  };

  return (
    <Link
      href={editRolePath}
      sx={{
        display: 'block',
        marginBottom: gutterBottom ? 0.5 : 0,
      }}
    >
      <CardActionArea sx={actionAreaStyles}>
        <Flex justifyContent="space-between">
          <Flex>
            <Avatar sx={avatarStyes} />

            <Box marginTop={-0.35}>
              <Typography
                display="inline-block"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                width={isDesktop ? '500px' : '250px'}
                marginBottom={-0.2}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: 12,
                }}
              >
                <Person sx={memberIconStyles} />
                {t('roles.labels.membersCount', { count: memberCount })}
              </Typography>
            </Box>
          </Flex>

          <ArrowForwardIos sx={{ alignSelf: 'center' }} />
        </Flex>
      </CardActionArea>
    </Link>
  );
};

export default Role;
