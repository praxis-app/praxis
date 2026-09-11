import { NavigationPaths } from '@/constants/shared.constants';
import { RoleListItem } from '../role-list-item';
import { useServerData } from '@/hooks/use-server-data';
import { type ServerRoleRes } from '@/types/role.types';

interface Props {
  serverRole: ServerRoleRes;
}

export const ServerRole = ({ serverRole }: Props) => {
  const { serverPath } = useServerData();
  const editRolePath = `${serverPath}${NavigationPaths.Roles}/${serverRole.id}/edit`;

  return (
    <RoleListItem
      to={editRolePath}
      color={serverRole.color}
      name={serverRole.name}
      memberCount={serverRole.memberCount}
      members={serverRole.members}
    />
  );
};
