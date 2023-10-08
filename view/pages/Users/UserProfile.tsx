import { useReactiveVar } from '@apollo/client';
import { Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { inviteTokenVar, isLoggedInVar } from '../../apollo/cache';
import { useUserProfileQuery } from '../../apollo/users/generated/UserProfile.query';
import Feed from '../../components/Shared/Feed';
import Link from '../../components/Shared/Link';
import ProgressBar from '../../components/Shared/ProgressBar';
import ToggleForms from '../../components/Shared/ToggleForms';
import UserProfileCard from '../../components/Users/UserProfileCard';
import { NavigationPaths } from '../../constants/shared.constants';

const UserProfile = () => {
  const inviteToken = useReactiveVar(inviteTokenVar);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { name } = useParams();
  const { data, loading, error } = useUserProfileQuery({
    variables: { name },
    skip: !name || !isLoggedIn,
  });

  const { t } = useTranslation();
  const theme = useTheme();

  if (!isLoggedIn) {
    return (
      <>
        <Typography sx={{ color: theme.palette.text.secondary }} gutterBottom>
          {t('prompts.permissionDenied')}
        </Typography>
        <Typography sx={{ color: theme.palette.text.secondary }}>
          Please{' '}
          {inviteToken && (
            <>
              <Link
                href={`${NavigationPaths.SignUp}/${inviteToken}`}
                sx={{ marginRight: '0.5ch' }}
              >
                {t('users.actions.signUp')}
              </Link>
              or
            </>
          )}
          <Link
            href={NavigationPaths.LogIn}
            sx={{ marginLeft: inviteToken ? '0.5ch' : 0 }}
          >
            {t('users.actions.logIn')}
          </Link>{' '}
          to view user profiles.
        </Typography>
      </>
    );
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { me, user } = data;
  const isMe = me?.id === user.id;

  return (
    <>
      <UserProfileCard user={user} />
      {isMe && <ToggleForms me={me} />}

      {user.profileFeed && <Feed feed={user.profileFeed} />}
    </>
  );
};

export default UserProfile;
