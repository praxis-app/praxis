import { Form, Formik } from 'formik';
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
    answers,
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ dirty, isSubmitting, setFieldValue, values, resetForm }) => (
        <Form>
          {questions.map((question) => (
            <AnswerQuestionsFormField
              key={question.id}
              question={question}
              answers={values.answers}
              setFieldValue={setFieldValue}
              onBlur={() => {
                onSaveProgress(values, dirty);
                resetForm();
              }}
            />
          ))}

          <Flex justifyContent="flex-end" paddingTop={0.25}>
            <PrimaryActionButton
              disabled={isSubmitting || isLoading || !dirty}
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
