import { Card, CardContent as MuiCardContent, styled } from '@mui/material';
import { GroupRoleFragment } from '../../apollo/groups/generated/GroupRole.fragment';
import { ServerRoleFragment } from '../../apollo/roles/generated/ServerRole.fragment';
import Role from '../../components/Roles/Role';

const CardContent = styled(MuiCardContent)(() => ({
  padding: 10,
  '&:last-child': {
    paddingBottom: 10,
  },
}));

interface Props {
  roles: ServerRoleFragment[] | GroupRoleFragment[];
}

const RoleList = ({ roles }: Props) => (
  <Card>
    <CardContent>
      {roles.map((role, index) => (
        <Role
          gutterBottom={index + 1 !== roles.length}
          key={role.id}
          role={role}
        />
      ))}
    </CardContent>
  </Card>
);

export default RoleList;
