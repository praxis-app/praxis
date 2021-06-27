import { useMutation } from "@apollo/client";
import Link from "next/link";
import { Button, CircularProgress } from "@material-ui/core";

import { APPROVE_MEMBER_REQUEST } from "../../apollo/client/mutations";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import { useUserById } from "../../hooks";

interface Props {
  memberRequest: MemberRequest;
  memberRequests: MemberRequest[];
  setMemberRequests: (memberRequests: MemberRequest[]) => void;
}

const MemberRequest = ({
  memberRequest,
  memberRequests,
  setMemberRequests,
}: Props) => {
  const user = useUserById(memberRequest.userId);
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

  if (user)
    return (
      <div className={styles.member}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <Link href={`/users/${user.name}`}>
            <a className={styles.userName}>{user.name}</a>
          </Link>
        </div>
        <Button
          onClick={() => approveMemberRequestMutation()}
          style={{ color: "white" }}
        >
          Approve
        </Button>
      </div>
    );
  return <CircularProgress style={{ color: "white", display: "block" }} />;
};

export default MemberRequest;
