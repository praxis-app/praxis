import { api } from '@/client/api-client';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { TopNav } from '@/components/nav/top-nav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

export const SignUp = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isLoggedIn, setInviteToken } = useAuthStore();

  const { t } = useTranslation();
  const { token } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { isFirstUser, isAnon, isRegistered, me } = useAuthData({
    isFirstUserQueryEnabled: true,
  });

  const { isLoading: isInviteLoading, error: inviteError } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      const { isValidInvite } = await api.isValidInvite(token!);
      if (!isValidInvite) {
        throw new Error('Invalid invite');
      }
      localStorage.setItem(LocalStorageKeys.InviteToken, token);
      setInviteToken(token);
      return isValidInvite;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (me && !isAnon) {
      navigate(NavigationPaths.Root);
      setIsRedirecting(true);
    }
  }, [me, navigate, setIsRedirecting, isAnon]);

  const handleLandingBackClick =
    state?.fromLanding === true
      ? () => navigate(NavigationPaths.About, { replace: true })
      : undefined;

  if (inviteError) {
    return (
      <>
        <TopNav onBackClick={handleLandingBackClick} />
        <Container>
          <p>{t('invites.prompts.expiredOrInvalid')}</p>
        </Container>
      </>
    );
  }

  if (isRedirecting || isRegistered || isInviteLoading) {
    return <ChannelSkeleton />;
  }

  if (isLoggedIn && !isAnon) {
    return (
      <>
        <TopNav onBackClick={handleLandingBackClick} />
        <Container>
          <p>{t('auth.prompts.alreadyRegistered')}</p>
        </Container>
      </>
    );
  }

  if (!token && !isFirstUser && !isAnon) {
    return (
      <>
        <TopNav onBackClick={handleLandingBackClick} />
        <Container>
          <p>{t('invites.prompts.inviteRequired')}</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <TopNav onBackClick={handleLandingBackClick} />

      <div className="flex h-full flex-col items-center justify-center p-3 pt-4 md:p-18">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              {t('auth.actions.createAccount')}
            </CardTitle>
            <CardDescription className="text-center">
              {isAnon
                ? t('auth.prompts.upgradeAccount')
                : t('auth.prompts.enterDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm setIsRedirecting={setIsRedirecting} />

            {!isAnon && (
              <div className="text-muted-foreground text-center text-sm">
                {t('auth.prompts.alreadyHaveAccount')}{' '}
                <Link
                  to={NavigationPaths.Login}
                  className="text-primary font-medium hover:underline"
                >
                  {t('auth.actions.signIn')}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
