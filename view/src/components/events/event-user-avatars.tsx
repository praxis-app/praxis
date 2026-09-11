import { UserAvatar } from '@/components/users/user-avatar';
import { type UserRes } from '@/types/user.types';

interface Props {
  users: UserRes[];
}

export const EventUserAvatars = ({ users }: Props) => {
  if (users.length === 0) return null;

  return (
    <div className="flex shrink-0 -space-x-2">
      {users.slice(0, 3).map((user) => (
        <UserAvatar
          key={user.id}
          userId={user.id}
          name={user.displayName || user.name}
          imageId={user.profilePicture?.id}
          className="border-card size-6 border-2"
          fallbackClassName="text-xs"
        />
      ))}
    </div>
  );
};
