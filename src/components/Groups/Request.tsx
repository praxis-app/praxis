import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
import { Button } from "@material-ui/core";

import { USER } from "../../apollo/client/queries";
import { APPROVE_MEMBER_REQUEST } from "../../apollo/client/mutations";

import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import Messages from "../../utils/messages";

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
  const [user, setUser] = useState<User>();
  const [approveMemberRequest] = useMutation(APPROVE_MEMBER_REQUEST);
  const userRes = useQuery(USER, {
    variables: { id: memberRequest.userId },
  });

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

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
  return <>{Messages.states.loading()}</>;
};

export default MemberRequest;
