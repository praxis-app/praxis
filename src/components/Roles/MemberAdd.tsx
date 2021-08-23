import { Checkbox, LinearProgress } from "@material-ui/core";
import UserAvatar from "../Users/Avatar";
import styles from "../../styles/Role/Member.module.scss";
import { useUserById } from "../../hooks";

interface Props {
  userId: string;
  selectedUsers: SelectedUser[];
  setSelectedUsers: (selectedUsers: SelectedUser[]) => void;
}

const RoleMemberAdd = ({ userId, selectedUsers, setSelectedUsers }: Props) => {
  const user = useUserById(userId);

  const handleChange = () => {
    if (isSelected())
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser.userId !== userId)
      );
    else setSelectedUsers([...selectedUsers, { userId }]);
  };

  const isSelected = (): boolean => {
    return !!selectedUsers.find(
      (selectedUser) => selectedUser.userId === userId
    );
  };

  if (user)
    return (
      <div className={styles.member}>
        <div className={styles.link}>
          <UserAvatar user={user} />
          <div className={styles.userName}>{user.name}</div>
        </div>

        <Checkbox
          checked={isSelected()}
          onChange={handleChange}
          style={{ color: "LightGray" }}
        />
      </div>
    );
  return <LinearProgress />;
};

export default RoleMemberAdd;
