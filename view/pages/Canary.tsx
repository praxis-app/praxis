import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../components/Shared/LevelOneHeading';

const Canary = () => {
  const { t } = useTranslation();

  return (
    <>
      <LevelOneHeading header>
        {t('about.headers.canaryStatement')}
      </LevelOneHeading>
    </>
  );
};

export default Canary;
