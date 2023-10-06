import { useReactiveVar } from '@apollo/client';
import { ArrowDropDown } from '@mui/icons-material';
import { Button, IconButton, SxProps } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { inviteTokenVar, isLoggedInVar } from '../../apollo/cache';
import { useIsFirstUserQuery } from '../../apollo/users/generated/IsFirstUser.query';
import { useMeQuery } from '../../apollo/users/generated/Me.query';
import { NavigationPaths } from '../../constants/shared.constants';
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
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const { data: isFirstUserData } = useIsFirstUserQuery({
    skip: isLoggedIn,
  });
  const { data: meData } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const me = meData?.me;
  const isFirstUser = isFirstUserData?.isFirstUser;
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
              {me.name}
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
            user={me}
          />
        </Flex>
      )}

      {!isLoggedIn && (
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
