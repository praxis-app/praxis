import { IoLogoGithub } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';

export const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-border border-t px-5 py-10 sm:px-6 sm:py-8 lg:px-8">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-sm sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
        <p className="leading-6">{t('landing.footer.description')}</p>
        <a
          href="https://github.com/praxis-app"
          target="_blank"
          rel="noreferrer"
          className="text-foreground inline-flex w-fit items-center justify-center gap-2 font-medium hover:underline"
        >
          <IoLogoGithub className="size-4" aria-hidden="true" />
          {t('landing.footer.viewSource')}
        </a>
      </div>
    </footer>
  );
};
