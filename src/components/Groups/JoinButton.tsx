import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@material-ui/core";

import { CURRENT_USER } from "../../apollo/client/queries";

import {
  CREATE_MEMBER_REQUEST,
  DELETE_MEMBER_REQUEST,
  DELETE_GROUP_MEMBER,
} from "../../apollo/client/mutations";
import { isLoggedIn } from "../../utils/auth";

interface Props {
  group: Group;
  memberRequests: MemberRequest[];
  groupMembers: GroupMember[];
  setMemberRequests: (memberRequests: MemberRequest[]) => void;
  setGroupMembers: (groupMembers: GroupMember[]) => void;
}

const JoinButton = ({
  group,
  memberRequests,
  groupMembers,
  setMemberRequests,
  setGroupMembers,
}: Props) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);

  const [createMemberRequest] = useMutation(CREATE_MEMBER_REQUEST);
  const [deleteMemberRequest] = useMutation(DELETE_MEMBER_REQUEST);
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  const alreadyRequested = () => {
    const request = memberRequests?.find(
      (request: MemberRequest) => request.userId === currentUser?.id
    );
    return request;
  };

  const alreadyJoined = () => {
    const member = groupMembers?.find(
      (member: GroupMember) => member.userId === currentUser?.id
    );
    return member;
  };

  const createMemberRequestMutation = async () => {
    const { data } = await createMemberRequest({
      variables: {
        userId: currentUser?.id,
        groupId: group.id,
      },
    });
    setMemberRequests([
      ...memberRequests,
      data.createMemberRequest.memberRequest,
    ]);
  };

  const deleteMemberRequestMutation = async () => {
    await deleteMemberRequest({
      variables: {
        id: alreadyRequested()?.id,
      },
    });
    setMemberRequests(
      memberRequests.filter((request) => request.userId !== currentUser?.id)
    );
  };

  const deleteGroupMemberMutation = async () => {
    await deleteGroupMember({
      variables: {
        id: alreadyJoined()?.id,
      },
    });
    setGroupMembers(
      groupMembers.filter((member) => member.userId !== currentUser?.id)
    );
  };

  if (!isLoggedIn(currentUser)) return <></>;

  if (!alreadyRequested() && !alreadyJoined())
    return (
      <Button
        onClick={() => createMemberRequestMutation()}
        style={{ color: "white" }}
      >
        Join
      </Button>
    );

  if (!alreadyJoined())
    return (
      <Button
        onClick={() => deleteMemberRequestMutation()}
        style={{ color: "white" }}
      >
        Cancel Request
      </Button>
    );

  if (alreadyJoined())
    return (
      <Button
        onClick={() => deleteGroupMemberMutation()}
        style={{ color: "white" }}
      >
        Leave
      </Button>
    );

  return <></>;
};

export default JoinButton;
