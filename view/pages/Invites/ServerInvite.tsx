import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { inviteTokenVar, isLoggedInVar } from '../../apollo/cache';
import { useServerInviteLazyQuery } from '../../apollo/invites/generated/ServerInvite.query';
import PublicGroupsFeed from '../../components/Groups/PublicGroupsFeed';
import ProgressBar from '../../components/Shared/ProgressBar';
import { INVITE_TOKEN } from '../../constants/server-invite.constants';
import { NavigationPaths } from '../../constants/shared.constants';
import { setLocalStorageItem } from '../../utils/shared.utils';

const ServerInvite = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const [getServerInvite, { loading, error }] = useServerInviteLazyQuery();

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

  if (!token) {
    return <Typography>{t('invites.prompts.inviteRequired')}</Typography>;
  }
  if (error) {
    return <Typography>{t('invites.prompts.expiredOrInvalid')}</Typography>;
  }
  if (loading || isLoggedIn) {
    return <ProgressBar />;
  }

  return <PublicGroupsFeed />;
};

export default ServerInvite;
