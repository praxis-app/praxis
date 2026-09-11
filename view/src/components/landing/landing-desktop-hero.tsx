import { LandingPrimaryButton } from '@/components/landing/landing-primary-button';
import { LandingVisual } from '@/components/landing/landing-visual';
import { Button } from '@/components/ui/button';
import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  canSignUp: boolean;
  isRegistered: boolean;
  isSignUpLoading: boolean;
  primaryCta: string;
  signUpPath: string;
}

export const LandingDesktopHero = ({
  canSignUp,
  isRegistered,
  isSignUpLoading,
  primaryCta,
  signUpPath,
}: Props) => {
  const { t } = useTranslation();

  return (
    <section className="relative hidden px-5 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:block lg:px-8 lg:pt-28 lg:pb-36">
      <div className="bg-praxis-coral/10 absolute top-8 left-1/2 z-0 size-128 -translate-x-1/2 rounded-full blur-3xl" />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-20">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="text-praxis-coral mb-4 text-xs leading-5 font-semibold tracking-[0.18em] uppercase lg:mb-5 lg:text-sm lg:tracking-[0.16em]">
            {t('landing.hero.eyebrow')}
          </p>
          <h1 className="text-4xl leading-[1.05] font-bold tracking-[-0.04em] text-balance sm:text-5xl lg:text-7xl lg:tracking-[-0.045em]">
            {t('landing.hero.title')}
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-7 sm:mt-6 sm:text-lg lg:mx-0 lg:text-xl lg:leading-8">
            {t('landing.hero.description')}
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:mt-9 lg:justify-start">
            <LandingPrimaryButton
              canSignUp={canSignUp}
              isRegistered={isRegistered}
              size="lg"
              className="[&_svg]:text-praxis-coral h-12 rounded-full bg-neutral-950 px-7 text-base text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              isLoading={isSignUpLoading}
              label={primaryCta}
              showArrow
              signUpPath={signUpPath}
            />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-base"
            >
              <Link to={NavigationPaths.Explore}>
                {t('landing.actions.explore')}
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground mx-auto mt-15 max-w-sm text-sm leading-6 text-balance lg:mx-0 lg:mt-10 lg:max-w-none lg:text-start lg:leading-normal lg:text-wrap">
            {t('landing.hero.openSource')}
          </p>
        </div>

        <LandingVisual variant="flow" />
      </div>
    </section>
  );
};
