import { CheckBox } from '@mui/icons-material';
import { SxProps, Typography, useTheme } from '@mui/material';
import { GroupRolePermissionInput } from '../../../apollo/gen';
import { ProposalActionPermissionFragment } from '../../../apollo/proposals/generated/ProposalActionPermission.fragment';
import { ChangeType } from '../../../constants/shared.constants';
import { ProposalActionType } from '../../../constants/proposal.constants';
import { getPermissionText } from '../../../utils/role.utils';
import ChangeIcon from './ChangeIcon';

const CHECK_BOX_ICON_STYLES: SxProps = {
  fontSize: 18,
  marginRight: '0.5ch',
  marginTop: 0.2,
};

interface Props {
  actionType: ProposalActionType;
  permissionName: keyof GroupRolePermissionInput;
  permissions: ProposalActionPermissionFragment | GroupRolePermissionInput;
}

const ProposalActionPermission = ({
  permissionName,
  permissions,
  actionType,
}: Props) => {
  const theme = useTheme();

  const { displayName } = getPermissionText(permissionName);
  const isChangingRole = actionType === ProposalActionType.ChangeRole;
  const isEnabled = permissions[permissionName];

  const permissionStyles: SxProps = {
    borderColor: theme.palette.divider,
    borderRadius: 1,
    borderStyle: isChangingRole ? 'solid' : undefined,
    borderWidth: isChangingRole ? 1 : undefined,
    marginBottom: isChangingRole ? 1 : 0.25,
    paddingX: isChangingRole ? 0.6 : 0,
    paddingY: isChangingRole ? 0.5 : 0,
    display: 'flex',
    fontSize: 14,
  };

  return (
    <Typography
      color={isChangingRole ? 'primary' : undefined}
      sx={permissionStyles}
    >
      {isChangingRole ? (
        <ChangeIcon
          changeType={isEnabled ? ChangeType.Add : ChangeType.Remove}
          sx={{ marginRight: '1ch' }}
          component="span"
        />
      ) : (
        <CheckBox color="inherit" sx={CHECK_BOX_ICON_STYLES} />
      )}

      {displayName}
    </Typography>
  );
};

export default ProposalActionPermission;
