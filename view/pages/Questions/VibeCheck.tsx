import { Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Question from '../../components/Questions/Question';
import QuestionFormModal from '../../components/Questions/QuestionFormModal';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerQuestionsQuery } from '../../graphql/questions/queries/gen/ServerQuestions.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';

const VibeCheck = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        <GhostButton
          sx={{ marginBottom: 3.5 }}
          onClick={() => setIsModalOpen(true)}
        >
          {isDesktop
            ? t('questions.headers.createQuestion')
            : t('actions.create')}
        </GhostButton>
      </Flex>

      {data?.serverQuestions.map((question) => (
        <Question key={question.id} question={question} />
      ))}

      <QuestionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default VibeCheck;
