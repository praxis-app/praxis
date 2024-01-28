import { Sync } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AnswerQuestionsForm from '../../components/Questions/AnswerQuestionsForm';
import AnsweredQuestions from '../../components/Questions/AnsweredQuestions';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const {
    data: vibeCheckData,
    loading: vibeCheckLoading,
    error: vibeCheckError,
  } = useVibeCheckQuery();

  const [
    answerQuestions,
    { loading: answerQuestionsLoading, error: answerQuestionsError },
  ] = useAnswerQuestionsMutation();

  const { t } = useTranslation();

  const handleSubmit = async (answersData: AnswerQuestionsInput) => {
    await answerQuestions({
      variables: {
        answersData: { ...answersData, isSubmitting: true },
      },
    });
  };

  const handleSaveProgress = async (
    answersData: AnswerQuestionsInput,
    dirty: boolean,
  ) => {
    if (!dirty) {
      return;
    }
    await answerQuestions({ variables: { answersData } });
  };

  if (vibeCheckError || answerQuestionsError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (vibeCheckLoading) {
    return <ProgressBar />;
  }

  if (!vibeCheckData) {
    return null;
  }

  const { questionnaireTicket } = vibeCheckData.me;
  const { status } = questionnaireTicket;

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('questions.labels.vibeCheck')}
        </LevelOneHeading>

        {answerQuestionsLoading && (
          <Typography alignSelf="start" paddingTop={0.3}>
            <Sync sx={{ fontSize: 18, marginBottom: -0.3, marginRight: 0.8 }} />
            {t('states.saving')}
          </Typography>
        )}
      </Flex>

      {status === QuestionnaireTicketStatus.InProgress && (
        <AnswerQuestionsForm
          questionnaireTicket={questionnaireTicket}
          isLoading={answerQuestionsLoading}
          onSaveProgress={handleSaveProgress}
          onSubmit={handleSubmit}
        />
      )}

      {status === QuestionnaireTicketStatus.Submitted && (
        <AnsweredQuestions questionnaireTicket={questionnaireTicket} />
      )}
    </>
  );
};

export default VibeCheck;
