import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CanaryStatement from '../../components/Settings/CanaryStatement';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useCanaryStatementQuery } from '../../graphql/settings/queries/gen/CanaryStatement.gen';

const CanaryPage = () => {
  const { data, loading, error } = useCanaryStatementQuery();
  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <LevelOneHeading header>
        {t('canary.headers.canaryStatement')}
      </LevelOneHeading>

      <CanaryStatement canary={data.publicCanary} />
    </>
  );
};

export default CanaryPage;
