import { Box, Switch, Typography } from '@mui/material';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import {
  GroupRolePermission,
  GroupRolePermissionInput,
  ProposalActionRoleInput,
} from '../../../apollo/gen';
import { GroupPermissionsFragment } from '../../../apollo/groups/generated/GroupPermissions.fragment';
import theme from '../../../styles/theme';
import { getPermissionText } from '../../../utils/role.utils';
import Flex from '../../Shared/Flex';

interface Props {
  formValues: ProposalActionRoleInput;
  permissionName: keyof GroupRolePermissionInput;
  permissions: GroupPermissionsFragment | GroupRolePermission;
  setFieldValue(field: string, value?: boolean): void;
}

const ProposePermissionToggle = ({
  formValues,
  permissionName,
  permissions,
  setFieldValue,
}: Props) => {
  const { displayName, description, inDev } = getPermissionText(permissionName);
  if (inDev) {
    return null;
  }

  const permissionInput =
    formValues.permissions && formValues.permissions[permissionName];
  const isEnabled = permissions[permissionName];
  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  const handleSwitchChange = ({
    target: { checked },
  }: ChangeEvent<HTMLInputElement>) => {
    const field = `permissions.${permissionName}`;

    if (!checked && isEnabled) {
      setFieldValue(field, false);
      return;
    }
    if (checked === isEnabled) {
      setFieldValue(field, undefined);
      return;
    }
    setFieldValue(field, true);
  };

  return (
    <Flex justifyContent="space-between" marginBottom={2.8}>
      <Box>
        <Typography>{displayName}</Typography>

        <Typography fontSize={12} sx={{ color: theme.palette.text.secondary }}>
          {description}
        </Typography>
      </Box>

      <Switch
        inputProps={{ 'aria-label': displayName || t('labels.switch') }}
        onChange={handleSwitchChange}
        checked={isChecked}
      />
    </Flex>
  );
};

export default ProposePermissionToggle;
