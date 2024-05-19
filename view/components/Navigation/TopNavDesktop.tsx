import { useReactiveVar } from '@apollo/client';
import { ExpandMore } from '@mui/icons-material';
import { Box, Button, IconButton, SxProps, useTheme } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import {
  inviteTokenVar,
  isAuthErrorVar,
  isAuthLoadingVar,
  isLoggedInVar,
} from '../../graphql/cache';
import { useIsFirstUserQuery } from '../../graphql/users/queries/gen/IsFirstUser.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import Flex from '../Shared/Flex';
import SearchBar from '../Shared/SearchBar';
import UserAvatar from '../Users/UserAvatar';
import TopNavDropdown from './TopNavDropdown';

const TopNavDesktop = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isAuthLoading = useReactiveVar(isAuthLoadingVar);
  const isAuthError = useReactiveVar(isAuthErrorVar);

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const { data: isFirstUserData } = useIsFirstUserQuery({
    skip: !isAuthError,
  });
  const { data: meData } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const me = meData?.me;
  const isFirstUser = isFirstUserData?.isFirstUser;
  const showAuthButtons = !isLoggedIn && !isAuthLoading;

  const signUpPath = isFirstUser
    ? NavigationPaths.SignUp
    : `${NavigationPaths.SignUp}/${inviteToken}`;

  const flexStyles: SxProps = {
    flexGrow: 1,
    justifyContent: 'space-between',
    height: 41.75,
    marginLeft: 3,
  };

  const iconBtnStyles: SxProps = {
    position: 'relative',
    width: 50,
    height: 50,
  };

  const iconWrapperStyles: SxProps = {
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

  const handleMenuButtonClick = (event: MouseEvent<HTMLButtonElement>) =>
    setMenuAnchorEl(event.currentTarget);

  const handleClose = () => setMenuAnchorEl(null);

  return (
    <Flex sx={flexStyles}>
      <SearchBar />

      {me && (
        <Box alignSelf="center">
          <IconButton
            aria-label={t('labels.menuButton')}
            edge="end"
            onClick={handleMenuButtonClick}
            sx={iconBtnStyles}
          >
            <UserAvatar user={me} size={40} />

            <Box sx={iconWrapperStyles}>
              <ExpandMore sx={{ fontSize: 15, marginTop: 0.05 }} />
            </Box>
          </IconButton>

          <TopNavDropdown
            anchorEl={menuAnchorEl}
            handleClose={handleClose}
            me={me}
          />
        </Box>
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
