import { Button, CircularProgress, SxProps, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Question from '../../components/Questions/Question';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import ProgressBar from '../../components/Shared/ProgressBar';
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
    { error: answerQuestionsError, loading: answerQuestionsLoading },
  ] = useAnswerQuestionsMutation();

  const { t } = useTranslation();

  const saveProgressBtnStyles: SxProps = {
    textTransform: 'none',
    borderRadius: 9999,
    paddingX: '20px',
  };

  const handleSubmit = async (answersData: AnswerQuestionsInput) => {
    await answerQuestions({ variables: { answersData } });
  };

  const handleSaveProgress = async (answersData: AnswerQuestionsInput) => {
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
  const { questions } = questionnaireTicket;

  const answers = questions.map(({ id, myAnswer }) => {
    if (!myAnswer) {
      return { questionId: id, text: '' };
    }
    return { questionId: id, text: myAnswer?.text };
  });

  const initialValues: AnswerQuestionsInput = {
    questionnaireTicketId: questionnaireTicket.id,
    answers,
  };

  return (
    <>
      <LevelOneHeading header>
        {t('questions.labels.vibeCheck')}
      </LevelOneHeading>

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ dirty, isSubmitting, setFieldValue, values }) => (
          <Form>
            {questions.map((question) => (
              <Question
                key={question.id}
                question={question}
                answers={values.answers}
                setFieldValue={setFieldValue}
              />
            ))}

            <Flex justifyContent="flex-end" gap="8px" paddingTop={0.25}>
              <Button
                onClick={() => handleSaveProgress(values)}
                startIcon={
                  answerQuestionsLoading && (
                    <CircularProgress
                      size={10}
                      sx={{ marginRight: '4px', color: 'inherit' }}
                    />
                  )
                }
                sx={saveProgressBtnStyles}
              >
                {t('questions.actions.saveProgress')}
              </Button>
              <PrimaryActionButton
                disabled={isSubmitting || !dirty}
                isLoading={isSubmitting}
                type="submit"
              >
                {t('actions.submit')}
              </PrimaryActionButton>
            </Flex>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default VibeCheck;
