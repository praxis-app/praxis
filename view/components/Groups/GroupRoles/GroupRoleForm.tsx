import { FormikHelpers } from 'formik';
import { useState } from 'react';
import { toastVar } from '../../../graphql/cache';
import { GroupRoleFragment } from '../../../graphql/groups/fragments/gen/GroupRole.gen';
import { useCreateGroupRoleMutation } from '../../../graphql/groups/mutations/gen/CreateGroupRole.gen';
import { useUpdateGroupRoleMutation } from '../../../graphql/groups/mutations/gen/UpdateGroupRole.gen';
import { DEFAULT_ROLE_COLOR } from '../../../constants/role.constants';
import { getRandomString } from '../../../utils/shared.utils';
import RoleForm from '../../Roles/RoleForm';

interface Props {
  editRole?: GroupRoleFragment;
  groupId: number;
}

const GroupRoleForm = ({ editRole, groupId }: Props) => {
  const [color, setColor] = useState(
    editRole ? editRole.color : DEFAULT_ROLE_COLOR,
  );
  const [colorPickerKey, setColorPickerKey] = useState('');
  const [createRole] = useCreateGroupRoleMutation();
  const [updateRole] = useUpdateGroupRoleMutation();

  const initialValues = {
    name: editRole ? editRole.name : '',
  };

  const handleCreate = async (
    formValues: typeof initialValues,
    { setSubmitting, resetForm }: FormikHelpers<typeof initialValues>,
  ) =>
    await createRole({
      variables: {
        groupRoleData: { color, groupId, ...formValues },
      },
      onCompleted() {
        setColor(DEFAULT_ROLE_COLOR);
        setSubmitting(false);
        resetForm();
      },
    });

  const handleSubmit = async (
    formValues: typeof initialValues,
    formHelpers: FormikHelpers<typeof initialValues>,
  ) => {
    try {
      if (editRole) {
        await updateRole({
          variables: {
            groupRoleData: {
              id: editRole.id,
              ...formValues,
              color,
            },
          },
        });
        return;
      }
      await handleCreate(formValues, formHelpers);
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    } finally {
      setColorPickerKey(getRandomString());
    }
  };

  return (
    <RoleForm
      color={color}
      setColor={setColor}
      colorPickerKey={colorPickerKey}
      handleSubmit={handleSubmit}
      initialValues={initialValues}
      editRole={editRole}
    />
  );
};

export default GroupRoleForm;
