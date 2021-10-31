import { useMutation } from "@apollo/client";
import { CSSProperties } from "@material-ui/styles";
import {
  CREATE_MEMBER_REQUEST,
  DELETE_MEMBER_REQUEST,
  DELETE_GROUP_MEMBER,
} from "../../apollo/client/mutations";
import Messages from "../../utils/messages";
import { useCurrentUser } from "../../hooks";
import styles from "../../styles/Group/JoinButton.module.scss";
import GhostButton from "../Shared/GhostButton";

interface Props {
  group: ClientGroup;
  memberRequests: ClientMemberRequest[];
  groupMembers: ClientGroupMember[];
  setMemberRequests: (memberRequests: ClientMemberRequest[]) => void;
  setGroupMembers: (groupMembers: ClientGroupMember[]) => void;
  style?: CSSProperties;
}

const JoinButton = ({
  group,
  memberRequests,
  groupMembers,
  setMemberRequests,
  setGroupMembers,
  style,
}: Props) => {
  const currentUser = useCurrentUser();
  const [createMemberRequest] = useMutation(CREATE_MEMBER_REQUEST);
  const [deleteMemberRequest] = useMutation(DELETE_MEMBER_REQUEST);
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);

  const alreadyRequested = () => {
    const request = memberRequests?.find(
      (request: ClientMemberRequest) => request.userId === currentUser?.id
    );
    return request;
  };

  const alreadyJoined = () => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
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

  if (!currentUser) return null;

  if (alreadyJoined())
    return (
      <GhostButton
        onClick={() =>
          window.confirm(Messages.groups.prompts.leaveGroup()) &&
          deleteGroupMemberMutation()
        }
      >
        <div className={styles.deleteButtonInner}>
          <span className={styles.leaveText}>
            {Messages.groups.actions.leave()}
          </span>
          <span className={styles.joinedText}>{Messages.groups.joined()}</span>
        </div>
      </GhostButton>
    );

  if (alreadyRequested() && !alreadyJoined())
    return (
      <GhostButton onClick={() => deleteMemberRequestMutation()}>
        {Messages.groups.actions.cancelRequest()}
      </GhostButton>
    );

  return (
    <GhostButton onClick={() => createMemberRequestMutation()} style={style}>
      {Messages.groups.actions.join()}
    </GhostButton>
  );
};

export default JoinButton;
