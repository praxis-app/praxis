import { useMutation } from "@apollo/client";
import Link from "next/link";
import { Button, LinearProgress, Typography } from "@material-ui/core";

import { APPROVE_MEMBER_REQUEST } from "../../apollo/client/mutations";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import { useUserById } from "../../hooks";
import Messages from "../../utils/messages";
import { ResourcePaths } from "../../constants/common";

interface Props {
  memberRequest: ClientMemberRequest;
  memberRequests: ClientMemberRequest[];
  setMemberRequests: (memberRequests: ClientMemberRequest[]) => void;
}

const MemberRequest = ({
  memberRequest,
  memberRequests,
  setMemberRequests,
}: Props) => {
  const [user, _, userLoading] = useUserById(memberRequest.userId);
  const [approveMemberRequest] = useMutation(APPROVE_MEMBER_REQUEST);

  const approveMemberRequestMutation = async () => {
    await approveMemberRequest({
      variables: {
        id: memberRequest.id,
      },
    });
    setMemberRequests(
      memberRequests.filter((request) => request.id !== memberRequest.id)
    );
  };

  if (userLoading) return <LinearProgress />;

  if (!user)
    return <Typography>{Messages.groups.notFound.request()}</Typography>;

  return (
    <div className={styles.member}>
      <div className={styles.link}>
        <UserAvatar user={user} />
        <Link href={`${ResourcePaths.User}${user.name}`}>
          <a className={styles.userName}>{user.name}</a>
        </Link>
      </div>
      <Button onClick={() => approveMemberRequestMutation()} color="primary">
        {Messages.groups.actions.approve()}
      </Button>
    </div>
  );
};

export default MemberRequest;
