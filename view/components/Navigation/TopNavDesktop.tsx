import { useReactiveVar } from '@apollo/client';
import { ArrowDropDown } from '@mui/icons-material';
import { Button, IconButton, SxProps } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import {
  isAuthErrorVar,
  inviteTokenVar,
  isAuthLoadingVar,
  isLoggedInVar,
} from '../../graphql/cache';
import { useIsFirstUserQuery } from '../../graphql/users/queries/gen/IsFirstUser.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { getUserProfilePath } from '../../utils/user.utils';
import Flex from '../Shared/Flex';
import Link from '../Shared/Link';
import SearchBar from '../Shared/SearchBar';
import UserAvatar from '../Users/UserAvatar';
import TopNavDropdown from './TopNavDropdown';

const TOP_NAV_STYLES: SxProps = {
  flexGrow: 1,
  justifyContent: 'space-between',
  height: 41.75,
  marginLeft: 3,
};
const USER_AVATAR_STYLES: SxProps = {
  marginRight: 1.3,
  height: 24,
  width: 24,
};
const PROFILE_BTN_STYLES: SxProps = {
  color: 'text.primary',
  fontSize: 17,
  fontWeight: 'bold',
  textTransform: 'none',
};

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

  const me = meData?.me;
  const isFirstUser = isFirstUserData?.isFirstUser;
  const showAuthButtons = !isLoggedIn && !isAuthLoading;

  const userProfilePath = getUserProfilePath(me?.name);
  const signUpPath = isFirstUser
    ? NavigationPaths.SignUp
    : `${NavigationPaths.SignUp}/${inviteToken}`;

  const handleMenuButtonClick = (event: MouseEvent<HTMLButtonElement>) =>
    setMenuAnchorEl(event.currentTarget);

  const handleClose = () => setMenuAnchorEl(null);

  return (
    <Flex sx={TOP_NAV_STYLES}>
      <SearchBar />

      {me && (
        <Flex>
          <Link href={userProfilePath}>
            <Button
              aria-label={t('navigation.profile')}
              sx={PROFILE_BTN_STYLES}
            >
              <UserAvatar user={me} sx={USER_AVATAR_STYLES} />
              {me.displayName || me.name}
            </Button>
          </Link>

          <IconButton
            aria-label={t('labels.menuButton')}
            onClick={handleMenuButtonClick}
            edge="end"
          >
            <ArrowDropDown sx={{ color: 'text.primary' }} />
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
