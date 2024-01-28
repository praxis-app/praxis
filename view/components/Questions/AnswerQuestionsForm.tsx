import { Form, Formik, FormikErrors } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnswerQuestionsInput } from '../../graphql/gen';
import { AnswerQuestionsFormFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsForm.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import AnswerQuestionsFormField from './AnswerQuestionsFormField';

interface Props {
  questionnaireTicket: AnswerQuestionsFormFragment;
  isLoading: boolean;
  onSubmit(answersData: AnswerQuestionsInput): void;
  onSaveProgress(answersData: AnswerQuestionsInput, dirty: boolean): void;
}

const AnswerQuestionsForm = ({
  questionnaireTicket,
  isLoading,
  onSubmit,
  onSaveProgress,
}: Props) => {
  const [errorsMap, setErrorsMap] = useState<Record<number, string>>({});

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

  const validate = ({ answers }: AnswerQuestionsInput) => {
    const errors: FormikErrors<AnswerQuestionsInput> = {};

    for (const answer of answers) {
      if (!answer.text.trim()) {
        setErrorsMap((prevErrorsMap) => ({
          ...prevErrorsMap,
          [answer.questionId]: t('questions.errors.missingAnswer'),
        }));
        errors.answers = t('questions.errors.missingAnswer');
      } else {
        setErrorsMap((prevErrorsMap) => ({
          ...prevErrorsMap,
          [answer.questionId]: '',
        }));
      }
    }

    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      enableReinitialize
    >
      {({
        dirty,
        isSubmitting,
        resetForm,
        setFieldValue,
        submitCount,
        values,
      }) => (
        <Form>
          {questions.map((question) => (
            <AnswerQuestionsFormField
              key={question.id}
              question={question}
              answers={values.answers}
              setFieldValue={setFieldValue}
              error={submitCount ? errorsMap[question.id] : undefined}
              onBlur={() => {
                onSaveProgress(values, dirty);
                resetForm();
              }}
            />
          ))}

          <Flex justifyContent="flex-end" paddingTop={0.25}>
            <PrimaryActionButton
              disabled={isSubmitting || isLoading}
              isLoading={isSubmitting || isLoading}
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
