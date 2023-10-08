import { Box, Switch, Typography } from '@mui/material';
import { t } from 'i18next';
import { ChangeEvent } from 'react';
import {
  GroupRolePermissionInput,
  ServerRolePermissionInput,
} from '../../apollo/gen';
import theme from '../../styles/theme';
import { getPermissionText } from '../../utils/role.utils';
import Flex from '../Shared/Flex';

interface Props {
  permissionName:
    | keyof ServerRolePermissionInput
    | keyof GroupRolePermissionInput;
  setFieldValue(field: string, value?: boolean): void;
  permissionInput?: boolean | null;
  isEnabled: boolean;
}

const PermissionToggle = ({
  permissionName,
  setFieldValue,
  permissionInput,
  isEnabled,
}: Props) => {
  const { displayName, description, inDev } = getPermissionText(permissionName);
  if (inDev) {
    return null;
  }

  const isChecked = !!(permissionInput !== undefined
    ? permissionInput
    : isEnabled);

  const handleSwitchChange = ({
    target: { checked },
  }: ChangeEvent<HTMLInputElement>) => {
    if (!checked && isEnabled) {
      setFieldValue(permissionName, false);
      return;
    }
    if (checked === isEnabled) {
      setFieldValue(permissionName, undefined);
      return;
    }
    setFieldValue(permissionName, true);
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

export default PermissionToggle;
