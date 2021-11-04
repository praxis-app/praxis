import Link from "next/link";
import { ResourcePaths, TypeNames } from "../../constants/common";
import { useUserById } from "../../hooks";
import Messages from "../../utils/messages";

interface Props {
  userId: string;
  withLink?: boolean;
}

const UserName = ({ userId, withLink }: Props) => {
  const [user, _, userLoading] = useUserById(userId);

  if (userLoading) return <>{Messages.states.loading()}</>;
  if (!user) return <>{Messages.items.notFound(TypeNames.User)}</>;
  if (withLink)
    return (
      <Link href={`${ResourcePaths.User}${user.name}`}>
        <a>{user.name}</a>
      </Link>
    );

  return <>{user.name}</>;
};

export default UserName;
