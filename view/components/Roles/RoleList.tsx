import { Card, CardContent as MuiCardContent, styled } from '@mui/material';
import Role from './Role/Role';
import { GroupRoleFragment } from './Role/graphql/generated/GroupRole.fragment';
import { ServerRoleFragment } from './Role/graphql/generated/ServerRole.fragment';

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
