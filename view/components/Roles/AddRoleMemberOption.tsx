import { UserAvatarFragment } from '../../apollo/users/generated/UserAvatar.fragment';
import RoleMemberOption from './RoleMemberOption';

interface Props {
  selectedUserIds: number[];
  setSelectedUserIds(selectedUsers: number[]): void;
  user: UserAvatarFragment;
}

const AddRoleMemberOption = ({
  selectedUserIds,
  setSelectedUserIds,
  user,
}: Props) => {
  const isSelected = selectedUserIds.some((userId) => userId === user.id);

  const handleChange = () => {
    if (isSelected) {
      setSelectedUserIds(
        selectedUserIds.filter((userId) => userId !== user.id),
      );
      return;
    }
    setSelectedUserIds([...selectedUserIds, user.id]);
  };

  return (
    <RoleMemberOption
      handleChange={handleChange}
      checked={isSelected}
      user={user}
    />
  );
};

export default AddRoleMemberOption;
