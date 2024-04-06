import { Button, FormGroup, SxProps } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { CreateQuestionInput } from '../../graphql/gen';
import { QuestionFormModalFragment } from '../../graphql/questions/fragments/gen/QuestionFormModal.gen';
import { useCreateQuestionMutation } from '../../graphql/questions/mutations/gen/CreateQuestion.gen';
import { useUpdateQuestionMutation } from '../../graphql/questions/mutations/gen/UpdateQuestion.gen';
import {
  ServerQuestionsDocument,
  ServerQuestionsQuery,
} from '../../graphql/questions/queries/gen/ServerQuestions.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

interface Props {
  isOpen: boolean;
  onClose(): void;
  onSubmit(): void;
  editQuestion?: QuestionFormModalFragment;
}

const QuestionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editQuestion,
}: Props) => {
  const [createQuestion] = useCreateQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const initialValues: CreateQuestionInput = {
    text: editQuestion?.text || '',
  };

  const title = editQuestion
    ? t('questions.headers.updateQuestion')
    : t('questions.headers.createQuestion');

  const cancelButtonStyles: SxProps = {
    marginTop: 1.5,
    textTransform: 'none',
    borderRadius: 9999,
    paddingX: '20px',
  };

  const handleSubmit = async (values: CreateQuestionInput) => {
    if (editQuestion) {
      await updateQuestion({
        variables: {
          questionData: {
            id: editQuestion.id,
            text: values.text,
          },
        },
        onError(err) {
          toastVar({
            status: 'error',
            title: err.message,
          });
        },
        onCompleted() {
          onSubmit();
        },
      });
      return;
    }
    await createQuestion({
      variables: {
        questionData: {
          text: values.text,
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<ServerQuestionsQuery>(
          {
            query: ServerQuestionsDocument,
          },
          (groupsData) =>
            produce(groupsData, (draft) => {
              draft?.serverQuestions.push(data.createQuestion.question);
            }),
        );
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
      onCompleted() {
        onSubmit();
      },
    });
  };

  const validate = ({ text }: CreateQuestionInput) => {
    const errors: FormikErrors<CreateQuestionInput> = {};
    if (!text?.trim()) {
      errors.text = t('questions.errors.missingText');
    }
    return errors;
  };

  return (
    <Modal
      title={title}
      topGap={isDesktop ? undefined : '150px'}
      contentStyles={{ minHeight: '150px' }}
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
      >
        {({ dirty, isSubmitting, errors, submitCount }) => (
          <Form>
            <FormGroup sx={{ marginBottom: 2 }}>
              <TextField
                autoComplete="off"
                error={!!errors.text && !!submitCount}
                label={t('questions.placeholders.text')}
                name="text"
                multiline
              />
            </FormGroup>

            <Flex justifyContent="flex-end" gap="8px">
              <Button onClick={onClose} sx={cancelButtonStyles}>
                {t('actions.cancel')}
              </Button>
              <PrimaryActionButton
                disabled={isSubmitting || !dirty}
                isLoading={isSubmitting}
                sx={{ marginTop: 1.5 }}
                type="submit"
              >
                {editQuestion ? t('actions.save') : t('actions.create')}
              </PrimaryActionButton>
            </Flex>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default QuestionFormModal;
