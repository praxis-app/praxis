import { UserAvatar } from '@/components/users/user-avatar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { type UserRes } from '@/types/user.types';
import { useTranslation } from 'react-i18next';
import { MdArrowForwardIos, MdPerson } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  to: string;
  color: string;
  name: string;
  memberCount: number;
  members: UserRes[];
}

export const RoleListItem = ({
  to,
  color,
  name,
  memberCount,
  members,
}: Props) => {
  const { t } = useTranslation();
  const isAboveMd = useIsDesktop();

  return (
    <Link to={to}>
      <div className="hover:bg-ring/10 cursor-pointer rounded-lg p-2 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <Avatar className="mr-4 size-10">
              <AvatarFallback
                className="font-medium text-black"
                style={{ backgroundColor: color }}
              >
                <MdPerson className="size-7" />
              </AvatarFallback>
            </Avatar>

            <div className="-mt-1 flex flex-col">
              <div
                className={cn(
                  'mb-0.5 truncate',
                  isAboveMd ? 'max-w-125' : 'max-w-62.5',
                )}
              >
                {name}
              </div>
              <div className="text-muted-foreground flex items-center text-xs">
                <MdPerson className="mr-1 size-4" />
                {t('roles.labels.membersCount', { count: memberCount })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {members.length > 0 && (
              <div className="flex shrink-0 -space-x-2">
                {members.slice(0, 3).map((member) => (
                  <UserAvatar
                    key={member.id}
                    userId={member.id}
                    name={member.displayName || member.name}
                    imageId={member.profilePicture?.id}
                    className="border-card size-6 border-2"
                    fallbackClassName="text-xs"
                  />
                ))}
              </div>
            )}

            <MdArrowForwardIos className="text-muted-foreground size-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
