import { Typography } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import {
  UpdateDefaultGroupInput,
  UpdateDefaultGroupsInput,
} from '../../graphql/gen';
import { useUpdateDefaultGroupsMutation } from '../../graphql/settings/mutations/gen/UpdateDefaultGroups.gen';
import { useAddDefaultGroupsModalQuery } from '../../graphql/settings/queries/gen/AddDefaultGroupsModal.gen';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';
import AddDefaultGroupsOption from './AddDefaultGroupsOption';

interface Props {
  isOpen: boolean;
  onClose(): void;
}

const AddDefaultGroupsModal = ({ isOpen, onClose }: Props) => {
  const {
    data: groupsData,
    loading: groupsLoading,
    error: groupsError,
  } = useAddDefaultGroupsModalQuery({
    variables: { input: { limit: null, offset: null } },
    skip: !isOpen,
  });

  const [updateDefaultGroups, { loading: updateGroupsLoading }] =
    useUpdateDefaultGroupsMutation();

  const { t } = useTranslation();

  const initialValues: UpdateDefaultGroupsInput = {
    groups: [],
  };

  const handleSubmit = async (defaultGroupsData: UpdateDefaultGroupsInput) =>
    await updateDefaultGroups({
      variables: {
        defaultGroupsData,
      },
      onCompleted() {
        toastVar({
          title: t('serverSettings.prompts.updatedDefaultGroups'),
          status: 'success',
        });
        onClose();
      },
      onError(err) {
        toastVar({
          title: err.message,
          status: 'error',
        });
      },
    });

  const handleGroupClick = (
    groupId: number,
    setFieldValue: (field: 'groups', value: UpdateDefaultGroupInput[]) => void,
    values: UpdateDefaultGroupsInput,
  ) => {
    if (!groupsData) {
      return;
    }
    const isDefault = groupsData.groups.some(
      (group) => group.id === groupId && group.isDefault,
    );
    const selectedGroup = values.groups.find(
      (group) => group.groupId === groupId,
    );
    if (selectedGroup) {
      setFieldValue(
        'groups',
        values.groups.filter((g) => g.groupId !== groupId),
      );
      return;
    }
    setFieldValue('groups', [
      ...values.groups,
      {
        groupId,
        isDefault: !isDefault,
      },
    ]);
  };

  if (groupsError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({
        dirty,
        isSubmitting,
        setFieldValue,
        submitForm,
        values,
        resetForm,
      }) => (
        <Modal
          title={t('serverSettings.headers.addDefaultGroups')}
          isLoading={isSubmitting || updateGroupsLoading}
          closingAction={() => submitForm().then(() => resetForm())}
          isClosingActionDisabled={!dirty}
          actionLabel={t('actions.save')}
          onClose={onClose}
          open={isOpen}
        >
          {groupsLoading && <ProgressBar />}

          {groupsData?.groups.map((group) => (
            <AddDefaultGroupsOption
              key={group.id}
              onClick={() => handleGroupClick(group.id, setFieldValue, values)}
              formValues={values}
              group={group}
            />
          ))}
        </Modal>
      )}
    </Formik>
  );
};

export default AddDefaultGroupsModal;
