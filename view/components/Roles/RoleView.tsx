import { Card, CardContent } from '@mui/material';
import { RoleViewFragment } from '../../graphql/roles/fragments/gen/RoleView.gen';

interface Props {
  role: RoleViewFragment;
}

const RoleView = ({ role }: Props) => {
  return (
    <Card>
      <CardContent>{JSON.stringify(role)}</CardContent>
    </Card>
  );
};

export default RoleView;
