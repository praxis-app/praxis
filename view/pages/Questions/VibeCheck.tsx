import { Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnswerQuestionsForm from '../../components/Questions/AnswerQuestionsForm';
import AnsweredQuestions from '../../components/Questions/AnsweredQuestions';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import { toastVar } from '../../graphql/cache';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const [errorsMap, setErrorsMap] = useState<Record<number, string>>({});

  const {
    data: vibeCheckData,
    loading: vibeCheckLoading,
    error: vibeCheckError,
  } = useVibeCheckQuery();

  const [answerQuestions, { loading: answerQuestionsLoading }] =
    useAnswerQuestionsMutation();

  const { t } = useTranslation();

  const handleSubmit = async (answersData: AnswerQuestionsInput) => {
    if (Object.values(errorsMap).some((error) => error)) {
      return;
    }
    if (!window.confirm(t('questions.prompts.confirmSubmit'))) {
      return;
    }
    await answerQuestions({
      variables: {
        answersData: { ...answersData, isSubmitting: true },
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
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
    await answerQuestions({
      variables: {
        answersData,
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  if (vibeCheckError) {
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
            <CircularProgress size={12} sx={{ marginRight: 1 }} />
            {t('states.saving')}
          </Typography>
        )}
      </Flex>

      {status === QuestionnaireTicketStatus.InProgress && (
        <>
          {questionnaireTicket.prompt && (
            <Card>
              <CardContent sx={{ '&:last-child': { paddingBottom: 2 } }}>
                <Typography>{questionnaireTicket.prompt}</Typography>
              </CardContent>
            </Card>
          )}

          <AnswerQuestionsForm
            questionnaireTicket={questionnaireTicket}
            isLoading={answerQuestionsLoading}
            onSaveProgress={handleSaveProgress}
            setErrorsMap={setErrorsMap}
            errorsMap={errorsMap}
            onSubmit={handleSubmit}
          />
        </>
      )}

      {status === QuestionnaireTicketStatus.Submitted && (
        <>
          <Card>
            <CardContent sx={{ '&:last-child': { paddingBottom: 2 } }}>
              <Typography>{t('questions.prompts.waitForResults')}</Typography>
            </CardContent>
          </Card>

          <AnsweredQuestions questionnaireTicket={questionnaireTicket} />
        </>
      )}
    </>
  );
};

export default VibeCheck;
