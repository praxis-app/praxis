import {
  Box,
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  styled,
} from '@mui/material';
import { ServerRoleViewFragment } from '../../../graphql/roles/fragments/gen/ServerRoleView.gen';
import Flex from '../../Shared/Flex';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

interface Props {
  role: ServerRoleViewFragment;
}

const ServerRoleView = ({ role }: Props) => {
  return (
    <Card>
      <CardHeader
        title={
          <Flex gap="10px" alignItems="center">
            <Box
              bgcolor={role.color}
              width="20px"
              height="20px"
              borderRadius={9999}
            />
            <Box>{role.name}</Box>
          </Flex>
        }
      />
      <CardContent>{JSON.stringify(role)}</CardContent>
    </Card>
  );
};

export default ServerRoleView;
