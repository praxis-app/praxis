import { Checkbox } from '@/components/ui/checkbox';
import { UserAvatar } from '@/components/users/user-avatar';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { type UserRes } from '@/types/user.types';

export interface RoleMemberOptionProps {
  selectedUserIds: string[];
  setSelectedUserIds(selectedUsers: string[]): void;
  className?: string;
  user: UserRes;
}

export const RoleMemberOption = ({
  selectedUserIds,
  setSelectedUserIds,
  className,
  user,
}: RoleMemberOptionProps) => {
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

  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);

  return (
    <div
      className={cn(
        'hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-5 rounded-lg py-3',
        className,
      )}
      onClick={handleChange}
    >
      <div className="flex items-center">
        <UserAvatar
          userId={user.id}
          name={name}
          imageId={user.profilePicture?.id}
          className="mr-3"
        />
        <span className="max-w-48 truncate select-none">{truncatedName}</span>
      </div>

      <Checkbox checked={isSelected} defaultChecked={isSelected} />
    </div>
  );
};
