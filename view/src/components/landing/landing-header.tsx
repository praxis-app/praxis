import appIconImg from '@/assets/images/app-icon.png';
import { LandingPrimaryButton } from '@/components/landing/landing-primary-button';
import { Button } from '@/components/ui/button';
import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  canSignUp: boolean;
  isRegistered: boolean;
  isSignUpLoading: boolean;
  primaryCta: string;
  showLogIn: boolean;
  signUpPath: string;
}

export const LandingHeader = ({
  canSignUp,
  isRegistered,
  isSignUpLoading,
  primaryCta,
  showLogIn,
  signUpPath,
}: Props) => {
  const { t } = useTranslation();

  return (
    <header className="border-border/70 bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <nav
        aria-label={t('landing.navigation.label')}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8"
      >
        <Link
          to={NavigationPaths.About}
          className="focus-visible:ring-ring flex items-center gap-2.5 rounded-md text-xl font-bold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
        >
          <img src={appIconImg} alt="" className="size-8" />
          {t('landing.brandName')}
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {showLogIn && (
            <Button asChild variant="ghost" className="px-3 sm:px-4">
              <Link to={NavigationPaths.Login} state={{ fromLanding: true }}>
                {t('landing.actions.logIn')}
              </Link>
            </Button>
          )}
          <LandingPrimaryButton
            canSignUp={canSignUp}
            className="rounded-full bg-neutral-950 px-4 text-white hover:bg-neutral-800 sm:px-5 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            isRegistered={isRegistered}
            isLoading={isSignUpLoading}
            label={primaryCta}
            signUpPath={signUpPath}
          />
        </div>
      </nav>
    </header>
  );
};
