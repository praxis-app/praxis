import { AccountBox, ExitToApp, Person, Settings } from '@mui/icons-material';
import { Menu, MenuItem, SvgIconProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLogOutMutation } from '../../apollo/auth/generated/LogOut.mutation';
import {
  isAuthLoadingVar,
  isLoggedInVar,
  isRefreshingTokenVar,
} from '../../apollo/cache';
import { TopNavDropdownFragment } from '../../apollo/users/generated/TopNavDropdown.fragment';
import { NavigationPaths } from '../../constants/shared.constants';
import { inDevToast } from '../../utils/shared.utils';

const ICON_PROPS: SvgIconProps = {
  fontSize: 'small',
  sx: {
    marginRight: 1,
  },
};

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  user: TopNavDropdownFragment;
}

const TopNavDropdown = ({
  anchorEl,
  handleClose,
  user: { name, serverPermissions },
}: Props) => {
  const [logOut] = useLogOutMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogOutButtonClick = () =>
    window.confirm(t('users.prompts.logOut')) &&
    logOut({
      onCompleted() {
        isLoggedInVar(false);
        isAuthLoadingVar(false);
        isRefreshingTokenVar(false);
        navigate(NavigationPaths.LogIn);
      },
      update: (cache) => cache.reset(),
    });

  const handleEditProfileButtonClick = () => {
    const path = `${NavigationPaths.Users}/${name}/edit`;
    navigate(path);
  };

  const handleRolesButtonClick = () => navigate(NavigationPaths.Roles);

  return (
    <Menu
      anchorEl={anchorEl}
      onClick={handleClose}
      onClose={handleClose}
      open={Boolean(anchorEl)}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      keepMounted
    >
      <MenuItem onClick={handleEditProfileButtonClick}>
        <Person {...ICON_PROPS} />
        {t('users.actions.editProfile')}
      </MenuItem>

      <MenuItem onClick={inDevToast}>
        <Settings {...ICON_PROPS} />
        {t('navigation.preferences')}
      </MenuItem>

      {serverPermissions.manageRoles && (
        <MenuItem onClick={handleRolesButtonClick}>
          <AccountBox {...ICON_PROPS} />
          {t('roles.actions.manageRoles')}
        </MenuItem>
      )}

      <MenuItem onClick={handleLogOutButtonClick}>
        <ExitToApp {...ICON_PROPS} />
        {t('users.actions.logOut')}
      </MenuItem>
    </Menu>
  );
};

export default TopNavDropdown;
