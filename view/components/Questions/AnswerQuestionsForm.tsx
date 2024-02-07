import { useReactiveVar } from '@apollo/client';
import { Form, Formik } from 'formik';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { AnswerQuestionsFormFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsForm.gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import AnswerQuestionsFormField from './AnswerQuestionsFormField';

interface Props {
  errorsMap: Record<number, string>;
  setErrorsMap: Dispatch<SetStateAction<Record<number, string>>>;
  questionnaireTicket: AnswerQuestionsFormFragment;
  setIsSavingProgress(isSavingProgress: boolean): void;
}

const AnswerQuestionsForm = ({
  questionnaireTicket,
  errorsMap,
  setErrorsMap,
  setIsSavingProgress,
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [answerQuestions, { loading }] = useAnswerQuestionsMutation();
  const { t } = useTranslation();

  const { questions } = questionnaireTicket;
  const answers = questions.map(({ id, myAnswer }) => {
    if (!myAnswer) {
      return { questionId: id, text: '' };
    }
    return { questionId: id, text: myAnswer?.text };
  });

  const initialValues: AnswerQuestionsInput = {
    questionnaireTicketId: questionnaireTicket.id,
    isSubmitting: false,
    answers,
  };

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

  const validate = ({ answers }: AnswerQuestionsInput) => {
    for (const answer of answers) {
      if (!answer.text.trim()) {
        setErrorsMap((prevErrorsMap) => ({
          ...prevErrorsMap,
          [answer.questionId]: t('questions.errors.missingAnswer'),
        }));
      } else {
        setErrorsMap((prevErrorsMap) => ({
          ...prevErrorsMap,
          [answer.questionId]: '',
        }));
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
      enableReinitialize
    >
      {({ dirty, isSubmitting, setFieldValue, submitCount, values }) => (
        <Form>
          {questions.map((question) => (
            <AnswerQuestionsFormField
              key={question.id}
              answers={values.answers}
              dirty={dirty}
              error={submitCount ? errorsMap[question.id] : undefined}
              question={question}
              questionnaireTicketId={questionnaireTicket.id}
              setFieldValue={setFieldValue}
              setIsSavingProgress={setIsSavingProgress}
            />
          ))}

          <Flex justifyContent="flex-end" paddingTop={0.25}>
            <PrimaryActionButton
              disabled={isSubmitting || loading}
              isLoading={isSubmitting || loading}
              type="submit"
            >
              {t('actions.submit')}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default AnswerQuestionsForm;
