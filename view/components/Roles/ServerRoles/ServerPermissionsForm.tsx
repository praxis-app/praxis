import { Box, BoxProps } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { SERVER_PERMISSION_NAMES } from '../../../constants/role.constants';
import { toastVar } from '../../../graphql/cache';
import { ServerRolePermissionInput } from '../../../graphql/gen';
import { ServerRolePermissionsFragment } from '../../../graphql/roles/fragments/gen/ServerRolePermissions.gen';
import { useUpdateServerRoleMutation } from '../../../graphql/roles/mutations/gen/UpdateServerRole.gen';
import Flex from '../../Shared/Flex';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';
import ServerPermissionToggle from './ServerPermissionToggle';

interface Props extends BoxProps {
  permissions: ServerRolePermissionsFragment;
  roleId: number;
}

const ServerPermissionsForm = ({ permissions, roleId, ...boxProps }: Props) => {
  const [updateRole, { loading }] = useUpdateServerRoleMutation();
  const { t } = useTranslation();

  const initialValues: ServerRolePermissionInput = {};

  const handleSubmit = async (
    permissions: ServerRolePermissionInput,
    { setSubmitting, resetForm }: FormikHelpers<ServerRolePermissionInput>,
  ) => {
    try {
      updateRole({
        variables: {
          serverRoleData: {
            id: roleId,
            permissions,
          },
        },
        onCompleted() {
          setSubmitting(false);
          resetForm();
        },
      });
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  return (
    <Box {...boxProps}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, isSubmitting, dirty, setFieldValue }) => (
          <Form>
            {SERVER_PERMISSION_NAMES.map((permissionName) => (
              <ServerPermissionToggle
                key={permissionName}
                permissionName={permissionName}
                setFieldValue={setFieldValue}
                permissions={permissions}
                formValues={values}
              />
            ))}
            <Flex justifyContent="end" sx={{ marginTop: 6 }}>
              <PrimaryActionButton
                disabled={isSubmitting || loading || !dirty}
                isLoading={isSubmitting || loading}
                type="submit"
              >
                {t('actions.save')}
              </PrimaryActionButton>
            </Flex>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ServerPermissionsForm;
