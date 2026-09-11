import { NavigationPaths } from '@/constants/shared.constants';
import { RoleListItem } from '../role-list-item';
import { type InstanceRoleRes } from '@/types/role.types';

interface Props {
  instanceRole: InstanceRoleRes;
}

export const InstanceRole = ({ instanceRole }: Props) => {
  const editRolePath = `${NavigationPaths.Roles}/${instanceRole.id}/edit`;

  return (
    <RoleListItem
      to={editRolePath}
      color={instanceRole.color}
      name={instanceRole.name}
      memberCount={instanceRole.memberCount}
      members={instanceRole.members}
    />
  );
};
