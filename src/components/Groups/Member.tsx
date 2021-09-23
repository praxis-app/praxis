import Link from "next/link";
import { Button, LinearProgress, Typography } from "@material-ui/core";
import { useMutation } from "@apollo/client";

import FollowButton from "../Follows/FollowButton";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Group/Member.module.scss";
import { useUserById, useFollowersByUserId } from "../../hooks";
import { DELETE_GROUP_MEMBER } from "../../apollo/client/mutations";
import Messages from "../../utils/messages";
import { ResourcePaths } from "../../constants/common";

interface Props {
  groupMember: ClientGroupMember;
  groupMembers: ClientGroupMember[];
  setGroupMembers: (members: ClientGroupMember[]) => void;
  canKickGroupMembers: boolean;
}

const GroupMember = ({
  groupMember,
  groupMembers,
  setGroupMembers,
  canKickGroupMembers,
}: Props) => {
  const { id, userId } = groupMember;
  const [user, _, userLoading] = useUserById(userId);
  const [followers, setFollowers, followersLoading] =
    useFollowersByUserId(userId);
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);

  const handleRemoveButtonClick = async () => {
    await deleteGroupMember({
      variables: {
        id,
      },
    });
    setGroupMembers(groupMembers.filter((member) => member.id !== id));
  };

  if (userLoading || followersLoading) return <LinearProgress />;

  if (!user)
    return <Typography>{Messages.groups.notFound.member()}</Typography>;

  return (
    <div className={styles.member}>
      <div className={styles.link}>
        <UserAvatar user={user} />
        <Link href={`${ResourcePaths.User}${user.name}`}>
          <a className={styles.userName}>{user.name}</a>
        </Link>
      </div>

      <div className={styles.buttons}>
        <FollowButton
          userId={userId}
          followers={followers}
          setFollowers={setFollowers}
        />

        {canKickGroupMembers && (
          <Button
            onClick={() =>
              window.confirm(Messages.groups.prompts.removeGroupMember()) &&
              handleRemoveButtonClick()
            }
            color="primary"
          >
            {Messages.groups.actions.remove()}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupMember;
