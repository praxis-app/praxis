import {
  AccountBox,
  ExitToApp,
  HowToReg,
  Person,
  QuestionAnswer,
  Settings,
} from '@mui/icons-material';
import { Menu, MenuItem, SvgIconProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  LocalStorageKey,
  NavigationPaths,
} from '../../constants/shared.constants';
import { useLogOutMutation } from '../../graphql/auth/mutations/gen/LogOut.gen';
import { isAuthLoadingVar, isLoggedInVar } from '../../graphql/cache';
import { MeQuery } from '../../graphql/users/queries/gen/Me.gen';

const ICON_PROPS: SvgIconProps = {
  fontSize: 'small',
  sx: {
    marginRight: 1,
  },
};

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  me: MeQuery['me'];
}

const TopNavDropdown = ({
  anchorEl,
  handleClose,
  me: { name, serverPermissions },
}: Props) => {
  const [logOut, { client }] = useLogOutMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogOutButtonClick = () =>
    window.confirm(t('users.prompts.logOut')) &&
    logOut({
      onCompleted() {
        isLoggedInVar(false);
        isAuthLoadingVar(false);
        navigate(NavigationPaths.LogIn);
        localStorage.removeItem(LocalStorageKey.AccessToken);
        client.cache.reset();
      },
      update: (cache) => cache.reset(),
    });

  const handleEditProfileButtonClick = () => {
    const path = `${NavigationPaths.Users}/${name}/edit`;
    navigate(path);
  };

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

      {serverPermissions.manageRoles && (
        <MenuItem onClick={() => navigate(NavigationPaths.Roles)}>
          <AccountBox {...ICON_PROPS} />
          {t('roles.actions.manageRoles')}
        </MenuItem>
      )}

      {serverPermissions.manageSettings && (
        <MenuItem onClick={() => navigate(NavigationPaths.ServerSettings)}>
          <Settings {...ICON_PROPS} />
          {t('navigation.serverSettings')}
        </MenuItem>
      )}

      {serverPermissions.manageQuestionnaireTickets && (
        <MenuItem
          onClick={() => navigate(NavigationPaths.ServerQuestionnaires)}
        >
          <QuestionAnswer {...ICON_PROPS} />
          {t('questions.labels.questionnaires')}
        </MenuItem>
      )}

      {serverPermissions.manageQuestions && (
        <MenuItem onClick={() => navigate(NavigationPaths.ServerQuestions)}>
          <HowToReg {...ICON_PROPS} />
          {t('questions.labels.questions')}
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
