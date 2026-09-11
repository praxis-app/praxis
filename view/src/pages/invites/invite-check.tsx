import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export const InviteCheck = () => {
  const { setInviteToken } = useAuthStore();
  const { isLoggedIn, isMeSuccess, isAuthError } = useAuthData();

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const { error } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      const { isValidInvite } = await api.isValidInvite(token);
      if (!isValidInvite) {
        throw new Error('Invalid invite');
      }

      setInviteToken(token);

      if (isLoggedIn) {
        const joinServerPagePath = `/i/${token}/join`;
        await navigate(joinServerPagePath);
      } else {
        localStorage.setItem(LocalStorageKeys.InviteToken, token);
        await navigate(NavigationPaths.About);
      }

      return isValidInvite;
    },
    enabled: !!token && (isMeSuccess || isAuthError),
  });

  if (!token) {
    return <p>{t('invites.prompts.inviteRequired')}</p>;
  }
  if (error) {
    return <p>{t('invites.prompts.expiredOrInvalid')}</p>;
  }

  return <ChannelSkeleton />;
};
