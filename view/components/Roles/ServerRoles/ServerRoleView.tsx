import { Card, CardContent } from '@mui/material';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';

interface Props {
  role: ServerRoleViewFragment;
}

const ServerRoleView = ({ role }: Props) => {
  return (
    <Card>
      <CardContent>{JSON.stringify(role)}</CardContent>
    </Card>
  );
};

export default ServerRoleView;
