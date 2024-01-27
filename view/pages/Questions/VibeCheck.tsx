import { Sync } from '@mui/icons-material';
import { Typography } from '@mui/material';
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
    { loading: answerQuestionsLoading, error: answerQuestionsError },
  ] = useAnswerQuestionsMutation();

  const { t } = useTranslation();

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

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ dirty, isSubmitting, setFieldValue, values }) => (
          <Form>
            {questions.map((question) => (
              <Question
                key={question.id}
                question={question}
                answers={values.answers}
                setFieldValue={setFieldValue}
                onBlur={() => handleSaveProgress(values)}
              />
            ))}

            <Flex justifyContent="flex-end" paddingTop={0.25}>
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
