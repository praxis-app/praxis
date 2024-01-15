import { useTranslation } from 'react-i18next';
import Modal from '../Shared/Modal';
import { Form, Formik } from 'formik';
import { FormGroup } from '@mui/material';
import { TextField } from '../Shared/TextField';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

enum RuleFormFieldName {
  Title = 'title',
  Description = 'description',
}

interface Props {
  isOpen: boolean;
  handleCloseModal: () => void;
}

const CreateRuleModal = ({ isOpen, handleCloseModal }: Props) => {
  const { t } = useTranslation();

  const initialValues = {
    [RuleFormFieldName.Title]: '',
    [RuleFormFieldName.Description]: '',
  };

  const handleSubmit = async (values: any) => {
    console.log(values);
  };

  return (
    <Modal
      title={t('rules.headers.createRule')}
      contentStyles={{ minHeight: '30vh' }}
      onClose={handleCloseModal}
      open={isOpen}
      centeredTitle
    >
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ dirty, isSubmitting }) => (
          <Form>
            <FormGroup sx={{ marginBottom: 2 }}>
              <TextField
                autoComplete="off"
                label={t('rules.placeholders.title')}
                name={RuleFormFieldName.Title}
              />
              <TextField
                autoComplete="off"
                label={t('rules.placeholders.description')}
                name={RuleFormFieldName.Description}
                multiline
              />
            </FormGroup>

            <Flex justifyContent="flex-end">
              <PrimaryActionButton
                disabled={isSubmitting || !dirty}
                isLoading={isSubmitting}
                sx={{ marginTop: 1.5 }}
                type="submit"
              >
                {t('actions.create')}
              </PrimaryActionButton>
            </Flex>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateRuleModal;
