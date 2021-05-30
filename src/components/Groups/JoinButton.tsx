import { useMutation } from "@apollo/client";
import { Button } from "@material-ui/core";

import {
  CREATE_MEMBER_REQUEST,
  DELETE_MEMBER_REQUEST,
  DELETE_GROUP_MEMBER,
} from "../../apollo/client/mutations";
import { isLoggedIn } from "../../utils/auth";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";

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
  const currentUser = useCurrentUser();
  const [createMemberRequest] = useMutation(CREATE_MEMBER_REQUEST);
  const [deleteMemberRequest] = useMutation(DELETE_MEMBER_REQUEST);
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);

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
        {Messages.groups.actions.join()}
      </Button>
    );

  if (!alreadyJoined())
    return (
      <Button
        onClick={() => deleteMemberRequestMutation()}
        style={{ color: "white" }}
      >
        {Messages.groups.actions.cancelRequest()}
      </Button>
    );

  if (alreadyJoined())
    return (
      <Button
        onClick={() => deleteGroupMemberMutation()}
        style={{ color: "white" }}
      >
        {Messages.groups.actions.leave()}
      </Button>
    );

  return <></>;
};

export default JoinButton;
