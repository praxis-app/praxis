import { UserAvatar } from '@/components/users/user-avatar';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import { type ForumPostSummaryRes } from '@/types/forum.types';
import { useTranslation } from 'react-i18next';
import { MdChatBubbleOutline, MdLockOutline } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Props {
  post: ForumPostSummaryRes;
  postPath: string;
  isSelected?: boolean;
}

export const ForumPostListItem = ({ post, postPath, isSelected }: Props) => {
  const { t } = useTranslation();
  const author = post.user.displayName || post.user.name;

  return (
    <Link
      to={postPath}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'hover:bg-accent/60 flex min-w-0 gap-3 rounded-lg border p-4 transition-colors',
        isSelected && 'bg-accent border-primary/40',
      )}
    >
      <UserAvatar
        className="mt-0.5 shrink-0"
        name={author}
        userId={post.user.id}
        imageId={post.user.profilePicture?.id}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="truncate font-medium">{post.title}</h2>
          {post.status === 'closed' && (
            <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
              <MdLockOutline />
              {t('forums.labels.closed')}
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span>{author}</span>
          <span>{timeAgo(post.createdAt)}</span>
          <span className="flex items-center gap-1">
            <MdChatBubbleOutline />
            {t('forums.labels.replyCount', { count: post.replyCount })}
          </span>
          <span>
            {t('forums.labels.active', {
              time: timeAgo(post.latestActivityAt),
            })}
          </span>
        </div>
      </div>
    </Link>
  );
};
