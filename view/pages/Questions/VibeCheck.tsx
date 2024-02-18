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
import { isLoggedInVar } from '../../graphql/cache';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const [errorsMap, setErrorsMap] = useState<Record<number, string>>({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const {
    data: vibeCheckData,
    loading: vibeCheckLoading,
    error: vibeCheckError,
  } = useVibeCheckQuery({ variables: { isLoggedIn } });

  const { t } = useTranslation();

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

  const renderCommentSection = () => (
    <>
      <Divider sx={{ marginBottom: 2.5, marginTop: 2 }} />

      <CommentsList
        comments={comments || []}
        currentUserId={me.id}
        questionnaireTicketId={id}
      />

      <CommentForm questionnaireTicketId={id} enableAutoFocus />
    </>
  );

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('questions.labels.vibeCheck')}
        </LevelOneHeading>

        {isSavingProgress && (
          <Typography alignSelf="start" paddingTop={0.3}>
            <CircularProgress size={12} sx={{ marginRight: 1 }} />
            {t('states.saving')}
          </Typography>
        )}
      </Flex>

      {status === QuestionnaireTicketStatus.InProgress && (
        <>
          <Card>
            <CardContent sx={{ '&:last-child': { paddingBottom: 0 } }}>
              <Typography>
                {prompt || t('questions.prompts.defaultQuestionnairePrompt')}
              </Typography>
              {renderCommentSection()}
            </CardContent>
          </Card>

          <AnswerQuestionsForm
            questionnaireTicket={questionnaireTicket}
            setIsSavingProgress={setIsSavingProgress}
            setErrorsMap={setErrorsMap}
            errorsMap={errorsMap}
          />
        </>
      )}

      {status === QuestionnaireTicketStatus.Submitted && (
        <>
          <Card>
            <CardContent sx={{ '&:last-child': { paddingBottom: 0 } }}>
              <Typography>{t('questions.prompts.waitForResults')}</Typography>
              {renderCommentSection()}
            </CardContent>
          </Card>

          {questions.map((question: AnsweredQuestionCardFragment) => (
            <AnsweredQuestionCard key={question.id} question={question} />
          ))}
        </>
      )}
    </>
  );
};

export default VibeCheck;
