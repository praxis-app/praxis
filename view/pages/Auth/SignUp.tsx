import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { inviteTokenVar, isLoggedInVar } from '../../apollo/cache';
import { useServerInviteLazyQuery } from '../../apollo/invites/generated/ServerInvite.query';
import { useIsFirstUserQuery } from '../../apollo/users/generated/IsFirstUser.query';
import SignUpForm from '../../components/Auth/SignUpForm';
import ProgressBar from '../../components/Shared/ProgressBar';
import { INVITE_TOKEN } from '../../constants/server-invite.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { setLocalStorageItem } from '../../utils/shared.utils';

const SignUp = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [
    getServerInvite,
    { loading: serverInviteLoading, error: serverInviteError },
  ] = useServerInviteLazyQuery();

  const {
    data,
    loading: userCountLoading,
    error: userCountError,
  } = useIsFirstUserQuery({ skip: isLoggedIn });

  useEffect(() => {
    if (isLoggedIn) {
      navigate(NavigationPaths.Home);
      return;
    }
    if (token) {
      getServerInvite({
        variables: { token },
        onCompleted({ serverInvite }) {
          inviteTokenVar(serverInvite.token);
          setLocalStorageItem(INVITE_TOKEN, serverInvite.token);
        },
      });
    }
  }, [isLoggedIn, token, navigate, getServerInvite]);

  if (serverInviteError) {
    return <Typography>{t('invites.prompts.expiredOrInvalid')}</Typography>;
  }
  if (userCountError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }
  if (serverInviteLoading || userCountLoading || isLoggedIn) {
    return <ProgressBar />;
  }
  if (!token && !data?.isFirstUser) {
    return <Typography>{t('invites.prompts.inviteRequired')}</Typography>;
  }

  return <SignUpForm />;
};

export default SignUp;
