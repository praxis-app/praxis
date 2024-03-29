import { ProposalActionRoleMemberInput } from '../../../graphql/gen';
import { RoleMemberFragment } from '../../../graphql/roles/fragments/gen/RoleMember.gen';
import { UserAvatarFragment } from '../../../graphql/users/fragments/gen/UserAvatar.gen';
import { ChangeType } from '../../../constants/shared.constants';
import RoleMemberOption from '../../Roles/RoleMemberOption';

interface Props {
  member: UserAvatarFragment;
  selectedMembers: ProposalActionRoleMemberInput[];
  setSelectedMembers(selectedMembers: ProposalActionRoleMemberInput[]): void;
  currentRoleMembers?: RoleMemberFragment[];
}

const ProposeRoleMemberOption = ({
  member,
  selectedMembers,
  setSelectedMembers,
  currentRoleMembers,
}: Props) => {
  const isSelectedToAdd = selectedMembers.some(
    ({ userId, changeType }) =>
      userId === member.id && changeType === ChangeType.Add,
  );
  const isSelectedToRemove = selectedMembers.some(
    ({ userId, changeType }) =>
      userId === member.id && changeType === ChangeType.Remove,
  );
  const isAlreadyAdded = currentRoleMembers?.some(({ id }) => id === member.id);

  const checked = (isAlreadyAdded && !isSelectedToRemove) || isSelectedToAdd;

  const handleChange = () => {
    if ((!isAlreadyAdded && checked) || (isAlreadyAdded && !checked)) {
      setSelectedMembers(
        selectedMembers.filter(({ userId }) => userId !== member.id),
      );
      return;
    }
    const changeType =
      isAlreadyAdded && checked ? ChangeType.Remove : ChangeType.Add;
    setSelectedMembers([...selectedMembers, { changeType, userId: member.id }]);
  };

  return (
    <RoleMemberOption
      handleChange={handleChange}
      checked={checked}
      user={member}
    />
  );
};

export default ProposeRoleMemberOption;
