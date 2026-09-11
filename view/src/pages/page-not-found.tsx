import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import pageNotFoundGif from '../assets/images/404.gif';

export const PageNotFound = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <img
        src={pageNotFoundGif}
        alt={t('errors.pageNotFound')}
        className="w-8/12 max-w-xl cursor-pointer"
        onClick={() => navigate(NavigationPaths.Root)}
        title={t('actions.goToHome')}
      />
    </div>
  );
};
