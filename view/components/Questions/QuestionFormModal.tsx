import { Button, FormGroup, SxProps } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

interface Props {
  isOpen: boolean;
  onClose(): void;
  editQuestion?: any;
}

const QuestionFormModal = ({ isOpen, onClose, editQuestion }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const initialValues: any = {
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

  const handleSubmit = async (values: any) => {
    console.log(values);
  };

  const validate = ({ text }: any) => {
    const errors: FormikErrors<any> = {};
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
                label={title}
                autoComplete="off"
                error={!!errors.text && !!submitCount}
                name="text"
                multiline
              />
            </FormGroup>

            <Flex justifyContent="flex-end" gap="12px">
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
