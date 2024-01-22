import { Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Question from '../../components/Questions/Question';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useVibeCheckQuery } from '../../graphql/questions/queries/gen/VibeCheck.gen';

const VibeCheck = () => {
  const { data, loading, error } = useVibeCheckQuery();
  const { t } = useTranslation();

  const initialValues = {};

  const handleSubmit = async (values: any) => {
    console.log(values);
  };

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

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ dirty, isSubmitting }) => (
          <Form>
            {data?.serverQuestions.map((question) => (
              <Question question={question} key={question.id} />
            ))}

            <Flex justifyContent="flex-end">
              <PrimaryActionButton
                disabled={isSubmitting || !dirty}
                isLoading={isSubmitting}
                sx={{ marginTop: 1.5 }}
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
