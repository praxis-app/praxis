import { useReactiveVar } from '@apollo/client';
import {
  AccountBox,
  ExitToApp,
  HowToReg,
  Person,
  QuestionAnswer,
  Settings,
  TaskAlt,
} from '@mui/icons-material';
import { Menu, MenuItem, SvgIconProps, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { useLogOutMutation } from '../../graphql/auth/mutations/gen/LogOut.gen';
import { isLoggedInVar, isVerifiedVar } from '../../graphql/cache';
import { MeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { logOutUser } from '../../utils/auth.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import UserAvatar from '../Users/UserAvatar';

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

const TopNavDropdown = ({ anchorEl, handleClose, me }: Props) => {
  const isVerified = useReactiveVar(isVerifiedVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [logOut] = useLogOutMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { name, displayName, serverPermissions } = me;
  const userName = displayName || name;

  const handleLogOutBtnClick = () =>
    window.confirm(t('users.prompts.logOut')) &&
    logOut({
      onCompleted() {
        navigate(NavigationPaths.LogIn);
        logOutUser();
      },
    });

  const handleProfileBtnClick = () => {
    const userProfilePath = getUserProfilePath(name);
    navigate(userProfilePath);
  };

  const handleEditProfileBtnClick = () => {
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
      <MenuItem onClick={handleProfileBtnClick} sx={{ gap: 1 }}>
        <UserAvatar size={20} />
        <Typography>{userName}</Typography>
      </MenuItem>

      <MenuItem onClick={handleEditProfileBtnClick}>
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

      {isLoggedIn && !isVerified && (
        <MenuItem onClick={() => navigate(NavigationPaths.VibeCheck)}>
          <TaskAlt {...ICON_PROPS} />
          {t('questions.labels.vibeCheck')}
        </MenuItem>
      )}

      <MenuItem onClick={handleLogOutBtnClick}>
        <ExitToApp {...ICON_PROPS} />
        {t('users.actions.logOut')}
      </MenuItem>
    </Menu>
  );
};

export default TopNavDropdown;
