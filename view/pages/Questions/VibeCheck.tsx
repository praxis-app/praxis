import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerQuestionsQuery } from '../../graphql/questions/queries/gen/ServerQuestions.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const VibeCheck = () => {
  const { data, loading, error } = useServerQuestionsQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('questions.labels.vibeCheck')}
        </LevelOneHeading>

        <GhostButton sx={{ marginBottom: 3.5 }}>
          {isDesktop
            ? t('questions.labels.createQuestion')
            : t('actions.create')}
        </GhostButton>
      </Flex>

      {JSON.stringify(data)}
    </>
  );
};

export default VibeCheck;
