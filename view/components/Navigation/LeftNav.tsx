import { useReactiveVar } from '@apollo/client';
import {
  Article as DocsIcon,
  EventNote as EventsIcon,
  Group as GroupsIcon,
  Home as HomeIcon,
  Info,
  Link as InvitesIcon,
  AccountBox as RolesIcon,
  SupervisedUserCircle as UsersIcon,
} from '@mui/icons-material';
import {
  List,
  ListItemButton as MuiListItemButton,
  ListItemIcon as MuiListItemIcon,
  ListItemText as MuiListItemText,
  ListItemTextProps as MuiListItemTextProps,
} from '@mui/material';
import { SxProps, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { isLoggedInVar } from '../../graphql/cache';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import Link from '../Shared/Link';

interface ListItemTextProps extends MuiListItemTextProps {
  isActive?: boolean;
}

const ListItemText = styled(MuiListItemText, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<ListItemTextProps>(({ isActive }) => ({
  '& .MuiListItemText-primary': {
    fontSize: 20,
    ...(isActive && {
      fontFamily: 'Inter Bold',
    }),
  },
}));

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  borderRadius: '6px',
  color: theme.palette.text.primary,
}));

const ListItemIcon = styled(MuiListItemIcon)(() => ({
  justifyContent: 'center',
  marginRight: 10,
  minWidth: 40,
}));

const LeftNav = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data: meData, loading } = useMeQuery({ skip: !isLoggedIn });

  const { pathname } = useLocation();
  const { t } = useTranslation();

  const me = meData?.me;
  const canBanUsers = me?.serverPermissions.removeMembers;
  const canManageRoles = me?.serverPermissions.manageRoles;
  const canCreateInvites = me?.serverPermissions.createInvites;
  const canManageInvites = me?.serverPermissions.manageInvites;

  const listStyles: SxProps = {
    position: 'fixed',
    left: 100,
    top: 110,
    width: 160,
  };

  const isActive = (path: NavigationPaths) => path === pathname;

  if (loading) {
    return null;
  }

  // TODO: Determine whether or not to refactor to use Stack instead of List
  // https://mui.com/material-ui/react-stack
  return (
    <List component="div" role="navigation" sx={listStyles}>
      <Link href={NavigationPaths.Home}>
        <ListItemButton>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText
            isActive={isActive(NavigationPaths.Home)}
            primary={t('navigation.home')}
          />
        </ListItemButton>
      </Link>

      <Link href={NavigationPaths.Groups}>
        <ListItemButton>
          <ListItemIcon>
            <GroupsIcon />
          </ListItemIcon>
          <ListItemText
            isActive={isActive(NavigationPaths.Groups)}
            primary={t('navigation.groups')}
          />
        </ListItemButton>
      </Link>

      <Link href={NavigationPaths.Events}>
        <ListItemButton>
          <ListItemIcon>
            <EventsIcon />
          </ListItemIcon>
          <ListItemText
            isActive={isActive(NavigationPaths.Events)}
            primary={t('navigation.events')}
          />
        </ListItemButton>
      </Link>

      {canManageRoles && (
        <Link href={NavigationPaths.Roles}>
          <ListItemButton>
            <ListItemIcon>
              <RolesIcon />
            </ListItemIcon>
            <ListItemText
              isActive={isActive(NavigationPaths.Roles)}
              primary={t('navigation.roles')}
            />
          </ListItemButton>
        </Link>
      )}

      {canBanUsers && (
        <Link href={NavigationPaths.Users}>
          <ListItemButton>
            <ListItemIcon>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText
              isActive={isActive(NavigationPaths.Users)}
              primary={t('navigation.users')}
            />
          </ListItemButton>
        </Link>
      )}

      {(canCreateInvites || canManageInvites) && (
        <Link href={NavigationPaths.Invites}>
          <ListItemButton>
            <ListItemIcon>
              <InvitesIcon />
            </ListItemIcon>
            <ListItemText
              isActive={isActive(NavigationPaths.Invites)}
              primary={t('navigation.invites')}
            />
          </ListItemButton>
        </Link>
      )}

      <Link href={NavigationPaths.About}>
        <ListItemButton>
          <ListItemIcon>
            <Info />
          </ListItemIcon>
          <ListItemText
            isActive={isActive(NavigationPaths.About)}
            primary={t('navigation.about')}
          />
        </ListItemButton>
      </Link>

      <Link href={NavigationPaths.Docs}>
        <ListItemButton>
          <ListItemIcon>
            <DocsIcon />
          </ListItemIcon>
          <ListItemText
            isActive={isActive(NavigationPaths.Docs)}
            primary={t('navigation.docs')}
          />
        </ListItemButton>
      </Link>
    </List>
  );
};

export default LeftNav;
