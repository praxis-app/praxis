/**
 * TODO: Add remaining functionality - below is a WIP
 *
 * Permissions that still need to be implemented fully:
 * - Manage Events
 * - Manage Comments
 * - Remove Members
 */

import { Box, BoxProps } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../../apollo/cache';
import { GroupRolePermissionInput } from '../../../apollo/gen';
import { GroupRolePermissionsFragment } from '../../../apollo/groups/generated/GroupRolePermissions.fragment';
import { useUpdateGroupRoleMutation } from '../../../apollo/groups/generated/UpdateGroupRole.mutation';
import { GROUP_PERMISSION_NAMES } from '../../../constants/role.constants';
import Flex from '../../Shared/Flex';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';
import GroupPermissionToggle from './GroupPermissionToggle';

interface Props extends BoxProps {
  permissions: GroupRolePermissionsFragment;
  roleId: number;
}

const GroupPermissionsForm = ({ permissions, roleId, ...boxProps }: Props) => {
  const [updateRole] = useUpdateGroupRoleMutation();
  const { t } = useTranslation();

  const initialValues: GroupRolePermissionInput = {};

  const handleSubmit = async (
    permissions: GroupRolePermissionInput,
    { setSubmitting, resetForm }: FormikHelpers<GroupRolePermissionInput>,
  ) => {
    try {
      updateRole({
        variables: {
          groupRoleData: {
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
            {GROUP_PERMISSION_NAMES.map((permissionName) => (
              <GroupPermissionToggle
                key={permissionName}
                permissionName={permissionName}
                setFieldValue={setFieldValue}
                permissions={permissions}
                formValues={values}
              />
            ))}
            <Flex justifyContent="end" sx={{ marginTop: 6 }}>
              <PrimaryActionButton
                disabled={isSubmitting || !dirty}
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

export default GroupPermissionsForm;
