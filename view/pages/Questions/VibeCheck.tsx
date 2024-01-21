import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerQuestionsQuery } from '../../graphql/questions/queries/gen/ServerQuestions.gen';

const VibeCheck = () => {
  const { data, loading, error } = useServerQuestionsQuery();
  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <LevelOneHeading header>
        {t('questions.labels.vibeCheck')}
      </LevelOneHeading>

      {JSON.stringify(data)}
    </>
  );
};

export default VibeCheck;
