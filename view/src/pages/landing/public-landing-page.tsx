import { LandingBenefitSection } from '@/components/landing/landing-benefit-section';
import { LandingDesktopHero } from '@/components/landing/landing-desktop-hero';
import { LandingDevelopmentNotice } from '@/components/landing/landing-development-notice';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingPrimaryButton } from '@/components/landing/landing-primary-button';
import { LandingVisual } from '@/components/landing/landing-visual';
import { Button } from '@/components/ui/button';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import {
  ArrowDown,
  CheckCircle2,
  MessageCircle,
  MessagesSquare,
  Users,
  Vote,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const PublicLandingPage = () => {
  const {
    inviteToken,
    isFirstUserLoading,
    isLoggedIn,
    isRegistered,
    showSignUp,
    signUpPath,
  } = useAuthData({ isFirstUserQueryEnabled: true });

  const { t } = useTranslation();

  const primaryCta = inviteToken
    ? t('landing.actions.acceptInvite')
    : t('landing.actions.signUp');

  const isSignUpLoading = !inviteToken && isFirstUserLoading;

  return (
    <div className="bg-background text-foreground min-h-dvh overflow-hidden">
      <LandingHeader
        canSignUp={showSignUp}
        isRegistered={isRegistered}
        isSignUpLoading={isSignUpLoading}
        primaryCta={primaryCta}
        showLogIn={!isLoggedIn}
        signUpPath={signUpPath}
      />

      <main>
        <section className="relative overflow-hidden bg-neutral-950 px-5 pt-10 pb-8 text-center text-white sm:px-8 lg:hidden">
          <div className="relative mx-auto max-w-xl">
            <div className="border-praxis-coral/35 absolute -top-16 -right-20 size-56 rounded-full border" />
            <div className="bg-praxis-coral/20 absolute top-36 -left-28 size-64 rounded-full" />
            <div className="bg-praxis-gold/30 absolute -right-10 bottom-28 size-36 rounded-full blur-2xl" />

            <div className="relative">
              <h1 className="mx-auto max-w-md text-[2.6rem] leading-[0.98] font-bold tracking-[-0.045em] text-balance">
                {t('landing.hero.title')}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base leading-7 text-neutral-300">
                {t('landing.mobileHero.description')}
              </p>

              <div className="mx-auto mt-7 flex max-w-sm flex-col gap-3">
                <LandingPrimaryButton
                  canSignUp={showSignUp}
                  isRegistered={isRegistered}
                  size="lg"
                  className="[&_svg]:text-praxis-coral h-13 w-full rounded-xl bg-white px-6 text-base text-neutral-950 shadow-lg shadow-black/20 hover:bg-neutral-100"
                  isLoading={isSignUpLoading}
                  label={primaryCta}
                  showArrow
                  signUpPath={signUpPath}
                />
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-13 w-full rounded-xl border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to={NavigationPaths.Explore}>
                    {t('landing.actions.explore')}
                  </Link>
                </Button>
              </div>

              <div className="relative mt-8 rounded-3xl border border-white/20 bg-white p-4 text-left text-neutral-950 shadow-2xl shadow-black/30">
                <div className="mb-4 flex items-center justify-between px-1">
                  <p className="text-sm font-bold">
                    {t('landing.mobileHero.visualTitle')}
                  </p>
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Users className="size-3.5" aria-hidden="true" />
                    {t('landing.mobileHero.online')}
                  </span>
                </div>

                <div className="rounded-2xl bg-neutral-100 p-4 text-neutral-950 dark:bg-neutral-900 dark:text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="bg-praxis-coral-soft text-praxis-coral flex size-8 items-center justify-center rounded-full shadow-sm">
                      <MessageCircle className="size-4" aria-hidden="true" />
                    </span>
                    {t('landing.mobileHero.conversationTitle')}
                  </div>
                  <p className="mt-2 pl-10 text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                    {t('landing.mobileHero.conversationDescription')}
                  </p>
                </div>

                <div className="flex h-9 items-center justify-center">
                  <span className="bg-praxis-coral flex size-6 items-center justify-center rounded-full text-white shadow-sm">
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="bg-praxis-green-soft rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="text-praxis-green flex size-8 items-center justify-center rounded-full bg-white shadow-sm">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    </span>
                    {t('landing.mobileHero.decisionTitle')}
                  </div>
                  <p className="mt-2 pl-10 text-xs leading-5 text-neutral-600">
                    {t('landing.mobileHero.decisionDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-68 text-center text-xs leading-5 font-medium text-balance text-neutral-300">
            {t('landing.hero.openSource')}
          </p>
        </section>

        <LandingDesktopHero
          canSignUp={showSignUp}
          isRegistered={isRegistered}
          isSignUpLoading={isSignUpLoading}
          primaryCta={primaryCta}
          signUpPath={signUpPath}
        />

        <div className="border-border border-y bg-neutral-50/60 dark:bg-white/2">
          <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <p className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {t('landing.bridge')}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-32 lg:px-8">
          <LandingBenefitSection
            eyebrow={t('landing.chat.eyebrow')}
            title={t('landing.chat.title')}
            description={t('landing.chat.description')}
            icon={MessagesSquare}
            visual={<LandingVisual variant="conversation" />}
          />
          <LandingDevelopmentNotice />
          <LandingBenefitSection
            eyebrow={t('landing.forums.eyebrow')}
            title={t('landing.forums.title')}
            description={t('landing.forums.description')}
            icon={CheckCircle2}
            visual={<LandingVisual variant="forum" />}
            reversed
          />
          <div className="hidden items-center gap-4 lg:flex" aria-hidden="true">
            <div className="via-border to-border h-px flex-1 bg-linear-to-r from-transparent" />
            <div className="flex items-center gap-2">
              <span className="bg-praxis-coral size-2 rounded-full" />
              <span className="bg-praxis-gold size-2 rounded-full" />
              <span className="bg-praxis-green size-2 rounded-full" />
            </div>
            <div className="from-border via-border h-px flex-1 bg-linear-to-r to-transparent" />
          </div>
          <LandingBenefitSection
            eyebrow={t('landing.decisions.eyebrow')}
            title={t('landing.decisions.title')}
            description={t('landing.decisions.description')}
            icon={Vote}
            visual={<LandingVisual variant="decision" />}
          />
        </div>

        <section className="px-4 pb-16 sm:px-6 sm:pb-32 lg:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-4xl bg-neutral-950 px-6 py-14 text-center text-white shadow-2xl shadow-black/20 sm:px-12 sm:py-20">
            <div className="border-praxis-coral/40 absolute -top-24 -right-20 size-72 rounded-full border" />
            <div className="bg-praxis-green/35 absolute -bottom-28 -left-12 size-64 rounded-full" />
            <div className="relative mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                {t('landing.finalCta.title')}
              </h2>
              <p className="mt-5 text-lg leading-8 text-pretty text-neutral-100">
                {t('landing.finalCta.description')}
              </p>
              <LandingPrimaryButton
                canSignUp={showSignUp}
                isRegistered={isRegistered}
                size="lg"
                className="[&_svg]:text-praxis-coral mt-8 h-12 rounded-full bg-white px-7 text-base text-neutral-950 hover:bg-neutral-100"
                isLoading={isSignUpLoading}
                label={primaryCta}
                showArrow
                signUpPath={signUpPath}
              />
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
