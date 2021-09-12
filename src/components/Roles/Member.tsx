import { IconButton, LinearProgress } from "@material-ui/core";
import { RemoveCircle } from "@material-ui/icons";

import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Role/Member.module.scss";
import { useUserById } from "../../hooks";
import { DELETE_ROLE_MEMBER } from "../../apollo/client/mutations";
import { useMutation } from "@apollo/client";
import Messages from "../../utils/messages";

interface Props {
  member: ClientRoleMember;
  members: ClientRoleMember[];
  setMembers: (members: ClientRoleMember[]) => void;
}

const RoleMember = ({ member, members, setMembers }: Props) => {
  const { id, userId } = member;
  const user = useUserById(userId);
  const [deleteRoleMember] = useMutation(DELETE_ROLE_MEMBER);

  const deleteRoleMemberHandler = async () => {
    await deleteRoleMember({
      variables: {
        id,
      },
    });
    if (members)
      setMembers(
        members.filter((member: ClientRoleMember) => member.id !== id)
      );
  };

  if (user)
    return (
      <div className={styles.member}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <div className={styles.userName}>{user.name}</div>
        </div>

        <IconButton
          onClick={() =>
            window.confirm(
              Messages.roles.members.prompts.removeMemberConfirm()
            ) && deleteRoleMemberHandler()
          }
        >
          <RemoveCircle color="primary" />
        </IconButton>
      </div>
    );
  return <LinearProgress />;
};

export default RoleMember;
