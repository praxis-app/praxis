import { GroupPermissionsMap } from '../groups/group-roles/models/group-permissions.type';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';

export interface UserPermissions {
  serverPermissions: ServerPermissions;
  groupPermissions: GroupPermissionsMap;
}
