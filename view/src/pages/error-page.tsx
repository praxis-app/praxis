import { useTranslation } from 'react-i18next';
import errorGif from '../assets/images/error.gif';
import { useNavigate } from 'react-router-dom';

export const ErrorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full items-center justify-center pt-20">
      <img
        src={errorGif}
        alt={t('errors.somethingWentWrong')}
        className="w-8/12 max-w-xl cursor-pointer rounded-full"
        onClick={() => navigate(0)}
        title={t('actions.refresh')}
      />
    </div>
  );
};
