import { useReactiveVar } from '@apollo/client';
import {
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommentForm from '../../components/Comments/CommentForm';
import CommentsList from '../../components/Comments/CommentList';
import AnswerQuestionsForm from '../../components/Questions/AnswerQuestionsForm';
import AnsweredQuestionCard from '../../components/Questions/AnsweredQuestionCard';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { QuestionnaireTicketStatus } from '../../constants/question.constants';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { MyAnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/MyAnsweredQuestionCard.gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const [errorsMap, setErrorsMap] = useState<Record<number, string>>({});
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const {
    data: vibeCheckData,
    loading: vibeCheckLoading,
    error: vibeCheckError,
  } = useVibeCheckQuery({ variables: { isLoggedIn } });

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
        isLoggedIn,
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
        isLoggedIn,
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

  const { me } = vibeCheckData;
  const { questionnaireTicket } = me;
  const { id, prompt, status, questions, comments } = questionnaireTicket;

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
          {prompt && (
            <Card>
              <CardContent sx={{ '&:last-child': { paddingBottom: 2 } }}>
                <Typography>{prompt}</Typography>
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
            <CardContent sx={{ '&:last-child': { paddingBottom: 0 } }}>
              <Typography>{t('questions.prompts.waitForResults')}</Typography>

              <Divider sx={{ marginBottom: 2.5, marginTop: 2 }} />

              <CommentsList
                comments={comments || []}
                currentUserId={me.id}
                questionnaireTicketId={id}
              />

              <CommentForm questionnaireTicketId={id} enableAutoFocus />
            </CardContent>
          </Card>

          {questions.map((question: MyAnsweredQuestionCardFragment) => (
            <AnsweredQuestionCard key={question.id} question={question} />
          ))}
        </>
      )}
    </>
  );
};

export default VibeCheck;
