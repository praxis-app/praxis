import { LinearProgress } from "@material-ui/core";
import { useUserById } from "../../hooks";

interface Props {
  userId: string;
  noLoader?: boolean;
}

const UserName = ({ userId, noLoader }: Props) => {
  const [user, _, userLoading] = useUserById(userId);
  if (userLoading && !noLoader) return <LinearProgress />;
  return <>{user?.name}</>;
};

export default UserName;
