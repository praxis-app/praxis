import { useReactiveVar } from '@apollo/client';
import {
  AccountBox,
  Close,
  Article as DocsIcon,
  Link as InvitesIcon,
  ExitToApp as SessionIcon,
  PersonAdd as SignUpIcon,
  SupervisedUserCircle as UsersIcon,
} from '@mui/icons-material';
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText as MuiListItemText,
} from '@mui/material';
import { SxProps, styled } from '@mui/material/styles';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogOutMutation } from '../../apollo/auth/generated/LogOut.mutation';
import {
  inviteTokenVar,
  isAuthLoadingVar,
  isLoggedInVar,
  isNavDrawerOpenVar,
  isRefreshingTokenVar,
} from '../../apollo/cache';
import { useIsFirstUserQuery } from '../../apollo/users/generated/IsFirstUser.query';
import { useMeQuery } from '../../apollo/users/generated/Me.query';
import { NavigationPaths } from '../../constants/shared.constants';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import UserAvatar from '../Users/UserAvatar';

const USER_AVATAR_STYLES: SxProps = {
  width: 21,
  height: 21,
  marginLeft: 0.25,
};

const CLOSE_BUTTON_FLEX_STYLES: SxProps = {
  marginY: 0.5,
  marginRight: 0.5,
};

const ListItemText = styled(MuiListItemText)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const NavDrawer = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const inviteToken = useReactiveVar(inviteTokenVar);
  const open = useReactiveVar(isNavDrawerOpenVar);

  const { data: meData } = useMeQuery({ skip: !isLoggedIn });
  const { data: isFirstUserData } = useIsFirstUserQuery({ skip: isLoggedIn });
  const [logOut] = useLogOutMutation();

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogOutClick = async () =>
    await logOut({
      onCompleted() {
        isLoggedInVar(false);
        isAuthLoadingVar(false);
        isRefreshingTokenVar(false);
        navigate(NavigationPaths.LogIn);
      },
      update: (cache) => cache.reset(),
    });

  const handleLinkClick = (path: string) => () => {
    handleClose();
    navigate(path);
  };

  const handleClose = () => isNavDrawerOpenVar(false);

  useEffect(() => {
    handleClose();
  }, [pathname]);

  const renderDocsButton = () => (
    <ListItemButton onClick={handleLinkClick(NavigationPaths.Docs)}>
      <ListItemIcon>
        <DocsIcon />
      </ListItemIcon>
      <ListItemText primary={t('navigation.docs')} />
    </ListItemButton>
  );

  const renderList = () => {
    if (!meData?.me) {
      const signUpPath = isFirstUserData?.isFirstUser
        ? NavigationPaths.SignUp
        : `${NavigationPaths.SignUp}/${inviteToken}`;

      return (
        <>
          {renderDocsButton()}

          <ListItemButton onClick={handleLinkClick(NavigationPaths.LogIn)}>
            <ListItemIcon>
              <SessionIcon />
            </ListItemIcon>
            <ListItemText primary={t('users.actions.logIn')} />
          </ListItemButton>

          {(inviteToken || isFirstUserData?.isFirstUser) && (
            <ListItemButton onClick={handleLinkClick(signUpPath)}>
              <ListItemIcon>
                <SignUpIcon />
              </ListItemIcon>
              <ListItemText primary={t('users.actions.signUp')} />
            </ListItemButton>
          )}
        </>
      );
    }

    const { me } = meData;
    const userProfilePath = getUserProfilePath(me.name);

    const { removeMembers, manageRoles, createInvites, manageInvites } =
      me.serverPermissions;

    return (
      <>
        <ListItemButton onClick={handleLinkClick(userProfilePath)}>
          <ListItemIcon>
            <UserAvatar user={me} sx={USER_AVATAR_STYLES} />
          </ListItemIcon>
          <ListItemText primary={me.name} />
        </ListItemButton>

        {manageRoles && (
          <ListItemButton onClick={handleLinkClick(NavigationPaths.Roles)}>
            <ListItemIcon>
              <AccountBox />
            </ListItemIcon>
            <ListItemText primary={t('navigation.roles')} />
          </ListItemButton>
        )}

        {removeMembers && (
          <ListItemButton onClick={handleLinkClick(NavigationPaths.Users)}>
            <ListItemIcon>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.users')} />
          </ListItemButton>
        )}

        {(createInvites || manageInvites) && (
          <ListItemButton onClick={handleLinkClick(NavigationPaths.Invites)}>
            <ListItemIcon>
              <InvitesIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.invites')} />
          </ListItemButton>
        )}

        {renderDocsButton()}

        <ListItemButton
          onClick={() =>
            window.confirm(t('users.prompts.logOut')) && handleLogOutClick()
          }
        >
          <ListItemIcon>
            <SessionIcon />
          </ListItemIcon>
          <ListItemText primary={t('users.actions.logOut')} />
        </ListItemButton>
      </>
    );
  };

  return (
    <Drawer
      anchor="right"
      onClick={handleClose}
      onClose={handleClose}
      open={open}
    >
      <main role="main">
        <Flex flexEnd sx={CLOSE_BUTTON_FLEX_STYLES}>
          <IconButton>
            <Close />
          </IconButton>
        </Flex>

        <Divider />

        <List sx={{ minWidth: '50vw' }}>{renderList()}</List>
      </main>
    </Drawer>
  );
};

export default NavDrawer;
