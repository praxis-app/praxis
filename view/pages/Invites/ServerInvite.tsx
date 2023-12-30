import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import PublicGroupsFeed from '../../components/Groups/PublicGroupsFeed';
import ProgressBar from '../../components/Shared/ProgressBar';
import {
  LocalStorageKey,
  NavigationPaths,
} from '../../constants/shared.constants';
import { inviteTokenVar, isLoggedInVar } from '../../graphql/cache';
import { useServerInviteLazyQuery } from '../../graphql/invites/queries/gen/ServerInvite.gen';

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
          localStorage.setItem(LocalStorageKey.InviteToken, serverInvite.token);
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
