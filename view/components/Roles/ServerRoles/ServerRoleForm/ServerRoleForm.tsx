import { FormikHelpers } from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { toastVar } from '../../../../apollo/cache';
import { CreateServerRoleInput } from '../../../../apollo/gen';
import { DEFAULT_ROLE_COLOR } from '../../../../constants/role.constants';
import {
  ServerRolesDocument,
  ServerRolesQuery,
} from '../../../../pages/Roles/ServerRolesIndex/generated/ServerRoles.query';
import { getRandomString } from '../../../../utils/shared.utils';
import { ServerRoleFragment } from '../../Role/graphql/generated/ServerRole.fragment';
import RoleForm from '../../RoleForm/RoleForm';
import { useCreateServerRoleMutation } from './graphql/generated/CreateServerRole.mutation';
import { useUpdateServerRoleMutation } from './graphql/generated/UpdateServerRole.mutation';

interface Props {
  editRole?: ServerRoleFragment;
}

const ServerRoleForm = ({ editRole }: Props) => {
  const [color, setColor] = useState(
    editRole ? editRole.color : DEFAULT_ROLE_COLOR,
  );
  const [colorPickerKey, setColorPickerKey] = useState('');
  const [createRole] = useCreateServerRoleMutation();
  const [updateRole] = useUpdateServerRoleMutation();

  const initialValues = {
    name: editRole ? editRole.name : '',
  };

  const handleCreate = async (
    formValues: Omit<CreateServerRoleInput, 'color'>,
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<Omit<CreateServerRoleInput, 'color'>>,
  ) =>
    await createRole({
      variables: {
        serverRoleData: { color, ...formValues },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createServerRole: { serverRole },
        } = data;
        cache.updateQuery<ServerRolesQuery>(
          { query: ServerRolesDocument },
          (postsData) =>
            produce(postsData, (draft) => {
              draft?.serverRoles.unshift(serverRole);
            }),
        );
      },
      onCompleted() {
        setColor(DEFAULT_ROLE_COLOR);
        setSubmitting(false);
        resetForm();
      },
    });

  const handleSubmit = async (
    formValues: Omit<CreateServerRoleInput, 'color'>,
    formHelpers: FormikHelpers<Omit<CreateServerRoleInput, 'color'>>,
  ) => {
    try {
      if (editRole) {
        await updateRole({
          variables: {
            serverRoleData: {
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

export default ServerRoleForm;
