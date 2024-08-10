import { Box, Switch, Typography } from '@mui/material';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import {
  GroupRolePermission,
  ProposalActionRoleInput,
  ServerRolePermission,
} from '../../../graphql/gen';
import theme from '../../../styles/theme';
import { PermissionName, getPermissionText } from '../../../utils/role.utils';
import Flex from '../../Shared/Flex';

interface Props {
  formValues: ProposalActionRoleInput;
  permissionName: PermissionName;
  permissions: Partial<GroupRolePermission | ServerRolePermission>;
  setFieldValue(field: string, value?: boolean): void;
}

const ProposePermissionToggle = ({
  formValues,
  permissionName,
  permissions,
  setFieldValue,
}: Props) => {
  const { displayName, description } = getPermissionText(permissionName, true);

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
