import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';

const Activity = () => {
  const { t } = useTranslation();

  return (
    <>
      <LevelOneHeading header>{t('navigation.activity')}</LevelOneHeading>
    </>
  );
};

export default Activity;
