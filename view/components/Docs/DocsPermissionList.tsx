import { Box } from '@mui/material';
import {
  GROUP_PERMISSION_NAMES,
  SERVER_PERMISSION_NAMES,
} from '../../constants/role.constants';
import { PermissionName, getPermissionText } from '../../utils/role.utils';
import DocsDefinitionListItem from './DocsDefinitionListItem';

interface Props {
  permissionType: 'server' | 'group';
}

const DocsPermissionList = ({ permissionType }: Props) => {
  const isGroup = permissionType === 'group';

  const permissions = isGroup
    ? GROUP_PERMISSION_NAMES
    : SERVER_PERMISSION_NAMES;

  return (
    <Box component="ul" paddingLeft={3} marginBottom={3}>
      {permissions.map((permission: PermissionName) => {
        const { displayName, description } = getPermissionText(
          permission,
          isGroup,
        );
        if (!displayName) {
          return null;
        }
        return (
          <DocsDefinitionListItem key={permission} name={displayName}>
            {description}
          </DocsDefinitionListItem>
        );
      })}
    </Box>
  );
};

export default DocsPermissionList;
