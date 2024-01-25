import { Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Question from '../../components/Questions/Question';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import ProgressBar from '../../components/Shared/ProgressBar';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const { data, loading, error } = useVibeCheckQuery();
  const { t } = useTranslation();

  const handleSubmit = async (values: any) => {
    console.log(values);
  };

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { questionnaireTicket } = data.me;
  const { questions } = questionnaireTicket;

  const initialValues: AnswerQuestionsInput = {
    questionnaireTicketId: questionnaireTicket.id,
    answers: questions.map(({ id, myAnswer }) => {
      if (!myAnswer) {
        return { questionId: id, text: '' };
      }
      return { questionId: id, text: myAnswer?.text };
    }),
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
