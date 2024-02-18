import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SignUpForm from '../../components/Auth/SignUpForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { LocalStorageKey } from '../../constants/shared.constants';
import { inviteTokenVar, isLoggedInVar } from '../../graphql/cache';
import { useServerInviteLazyQuery } from '../../graphql/invites/queries/gen/ServerInvite.gen';
import { useIsFirstUserQuery } from '../../graphql/users/queries/gen/IsFirstUser.gen';

const SignUp = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [
    getServerInvite,
    { loading: serverInviteLoading, error: serverInviteError },
  ] = useServerInviteLazyQuery();

  const {
    data,
    loading: isFirstUserLoading,
    error: isFirstUserError,
  } = useIsFirstUserQuery({ skip: isLoggedIn });

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getServerInvite({
        variables: { token },
        onCompleted({ serverInvite }) {
          inviteTokenVar(serverInvite.token);
          localStorage.setItem(LocalStorageKey.InviteToken, serverInvite.token);
        },
      });
    }
  }, [token, navigate, getServerInvite]);

  if (serverInviteError) {
    return <Typography>{t('invites.prompts.expiredOrInvalid')}</Typography>;
  }
  if (isFirstUserError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (serverInviteLoading || isFirstUserLoading) {
    return <ProgressBar />;
  }
  if (isLoggedIn) {
    return <Typography>{t('users.prompts.alreadyRegistered')}</Typography>;
  }
  if (!token && !data?.isFirstUser) {
    return <Typography>{t('invites.prompts.inviteRequired')}</Typography>;
  }

  return <SignUpForm isFirstUser={!!data?.isFirstUser} />;
};

export default SignUp;
