import { useReactiveVar } from '@apollo/client';
import {
  ArrowBack,
  Chat,
  ExpandMore,
  Notifications,
  Tag,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import {
  activeChatVar,
  inviteTokenVar,
  isAuthErrorVar,
  isAuthLoadingVar,
  isLoggedInVar,
} from '../../graphql/cache';
import { useIsFirstUserQuery } from '../../graphql/users/queries/gen/IsFirstUser.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useAboveBreakpoint } from '../../hooks/shared.hooks';
import NotificationCount from '../Notifications/NotificationCount';
import Flex from '../Shared/Flex';
import SearchBar from '../Shared/SearchBar';
import UserAvatar from '../Users/UserAvatar';
import TopNavDropdown from './TopNavDropdown';

const TopNavDesktop = () => {
  const activeChat = useReactiveVar(activeChatVar);
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isAuthError = useReactiveVar(isAuthErrorVar);
  const isAuthLoading = useReactiveVar(isAuthLoadingVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const { data: isFirstUserData } = useIsFirstUserQuery({
    skip: !isAuthError,
  });
  const { data: meData } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { t } = useTranslation();
  const isAboveLarge = useAboveBreakpoint('lg');
  const navigate = useNavigate();
  const theme = useTheme();

  const me = meData?.me;
  const isFirstUser = isFirstUserData?.isFirstUser;
  const showAuthButtons = !isLoggedIn && !isAuthLoading;

  const signUpPath = isFirstUser
    ? NavigationPaths.SignUp
    : `${NavigationPaths.SignUp}/${inviteToken}`;

  const rootStyles: SxProps = {
    flexGrow: 1,
    justifyContent: 'space-between',
    height: 41.75,
    marginLeft: 1.4,
  };
  const showMenuBtnStyles: SxProps = {
    position: 'relative',
    width: 50,
    height: 50,
  };
  const showMenuBadgeStyles: SxProps = {
    bgcolor: 'background.secondary',
    border: `2px solid ${theme.palette.background.paper}`,
    borderRadius: 9999,
    height: 16,
    width: 16,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 30,
    right: 2,
  };
  const iconWrapperStyles: SxProps = {
    bgcolor: 'background.secondary',
    minWidth: 40,
    minHeight: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const chatIconStyles: SxProps = {
    marginTop: 0.2,
    marginLeft: 0.05,
    fontSize: 20,
  };

  const handleMenuButtonClick = (event: MouseEvent<HTMLButtonElement>) =>
    setMenuAnchorEl(event.currentTarget);

  const handleClose = () => setMenuAnchorEl(null);

  return (
    <Flex sx={rootStyles}>
      {!activeChat && <SearchBar />}

      {activeChat && (
        <Flex alignSelf="center" alignItems="center">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ marginRight: 1.25 }}
            edge="start"
          >
            <ArrowBack />
          </IconButton>
          <Tag sx={{ marginRight: '0.25ch', color: 'text.secondary' }} />
          <Typography fontFamily="Inter Bold">{activeChat.name}</Typography>
        </Flex>
      )}

      {me && (
        <Flex alignSelf="center">
          <IconButton
            sx={{ width: 50, height: 50 }}
            onClick={() => navigate(NavigationPaths.Chats)}
          >
            <Flex sx={iconWrapperStyles}>
              <Chat sx={chatIconStyles} />
            </Flex>
          </IconButton>

          {isAboveLarge && (
            <IconButton
              sx={{ width: 50, height: 50 }}
              onClick={() => navigate(NavigationPaths.Activity)}
            >
              <Flex sx={iconWrapperStyles}>
                <Notifications sx={{ marginBottom: 0.3 }} />
                <NotificationCount bottom={31} left={31} size="17px" />
              </Flex>
            </IconButton>
          )}

          <IconButton
            aria-label={t('labels.menuButton')}
            onClick={handleMenuButtonClick}
            sx={showMenuBtnStyles}
          >
            <UserAvatar user={me} minWidth={40} minHeight={40} />
            <Box sx={showMenuBadgeStyles}>
              <ExpandMore sx={{ fontSize: 15, marginTop: 0.05 }} />
            </Box>
          </IconButton>

          <TopNavDropdown
            anchorEl={menuAnchorEl}
            handleClose={handleClose}
            me={me}
          />
        </Flex>
      )}

      {showAuthButtons && (
        <Flex>
          <Button
            onClick={() => navigate(NavigationPaths.LogIn)}
            sx={{ color: 'text.primary' }}
          >
            {t('users.actions.logIn')}
          </Button>

          {(inviteToken || isFirstUser) && (
            <Button
              onClick={() => navigate(signUpPath)}
              sx={{ color: 'text.primary' }}
            >
              {t('users.actions.signUp')}
            </Button>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default TopNavDesktop;
