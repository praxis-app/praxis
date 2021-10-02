import { useUserById } from "../../hooks";
import Messages from "../../utils/messages";

const UserName = ({ userId }: { userId: string }) => {
  const [user, _, userLoading] = useUserById(userId);
  if (userLoading) return <>{Messages.states.loading()}</>;
  return <>{user?.name}</>;
};

export default UserName;
