import { UserAvatar } from '@/components/users/user-avatar';
import { Button } from '@/components/ui/button';
import { lastReplyTime } from '@/lib/time.utils';
import { type UserRes } from '@/types/user.types';
import { useTranslation } from 'react-i18next';
import { LuMessageCircle } from 'react-icons/lu';

interface Props {
  replyCount: number;
  replyUsers: UserRes[];
  latestReplyAt: string | null;
  onOpen: () => void;
}

export const MessageThreadSummary = ({
  replyCount,
  replyUsers,
  latestReplyAt,
  onOpen,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary mt-1.5 -ml-2 h-auto min-h-8 flex-wrap gap-x-2 gap-y-0.5 px-2 text-xs font-medium"
      onClick={onOpen}
    >
      {replyUsers.length ? (
        <span className="flex -space-x-1.5" aria-hidden="true">
          {replyUsers.slice(0, 3).map((user) => (
            <UserAvatar
              key={user.id}
              name={user.displayName || user.name}
              userId={user.id}
              imageId={user.profilePicture?.id}
              className="border-background size-6 border-2"
              fallbackClassName="text-[0.625rem] font-medium"
              skipLoadAnimation
            />
          ))}
        </span>
      ) : (
        <LuMessageCircle className="size-4" />
      )}
      <span>{t('messages.labels.replyCount', { count: replyCount })}</span>
      {latestReplyAt && (
        <span className="text-muted-foreground text-xs">
          {lastReplyTime(latestReplyAt)}
        </span>
      )}
    </Button>
  );
};
