import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useCanaryStatementQuery } from '../../graphql/settings/queries/gen/CanaryStatement.gen';

const Canary = () => {
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

  const {
    serverConfig: { canaryStatement, showCanaryStatement },
  } = data;

  return (
    <>
      <LevelOneHeading header>
        {t('about.headers.canaryStatement')}
      </LevelOneHeading>

      {showCanaryStatement ? (
        <Typography>{canaryStatement}</Typography>
      ) : (
        <Typography>{t('about.prompts.canaryStatementMissing')}</Typography>
      )}
    </>
  );
};

export default Canary;
