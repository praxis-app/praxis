import { api } from '@/client/api-client';
import { ForumPostForm } from '@/components/forum/forum-post-form';
import { ForumPostListItem } from '@/components/forum/forum-post-list-item';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthData } from '@/hooks/use-auth-data';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useServerData } from '@/hooks/use-server-data';
import { type ChannelRes } from '@/types/channel.types';
import { type ForumPostSort, type ForumPostStatus } from '@/types/forum.types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';

const FORUM_POSTS_PAGE_SIZE = 20;

interface Props {
  channel: ChannelRes;
  selectedPostId?: string;
}

export const ForumPostList = ({ channel, selectedPostId }: Props) => {
  const [sort, setSort] = useState<ForumPostSort>('recent');
  const [status, setStatus] = useState<ForumPostStatus | 'all'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { serverId, serverPath } = useServerData();
  const { inviteToken, isLoggedIn } = useAuthData();

  const { t } = useTranslation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        'servers',
        serverId,
        'channels',
        channel.id,
        'forum',
        'posts',
        sort,
        status,
        inviteToken,
      ],
      queryFn: ({ pageParam }) => {
        if (!serverId) throw new Error('Server ID is required');
        return api.getForumPosts(
          serverId,
          channel.id,
          sort,
          status === 'all' ? undefined : status,
          pageParam,
          FORUM_POSTS_PAGE_SIZE,
        );
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
      enabled: !!serverId,
    });

  const posts = Array.from(
    new Map(
      data?.pages.flatMap((page) => page.posts).map((post) => [post.id, post]),
    ).values(),
  );

  const listBottomRef = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
    onLoadMore: () => {
      void fetchNextPage();
    },
  });

  return (
    <main
      data-testid="forum-post-list"
      className="min-h-0 flex-1 overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as ForumPostSort)}
            >
              <SelectTrigger aria-label={t('forums.labels.sort')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">
                  {t('forums.sort.recent')}
                </SelectItem>
                <SelectItem value="newest">
                  {t('forums.sort.newest')}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as ForumPostStatus | 'all')
              }
            >
              <SelectTrigger aria-label={t('forums.labels.filter')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('forums.filters.all')}</SelectItem>
                <SelectItem value="open">{t('forums.filters.open')}</SelectItem>
                <SelectItem value="closed">
                  {t('forums.filters.closed')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label={t('forums.actions.newPost')}
            className="shrink-0 disabled:pointer-events-auto disabled:cursor-not-allowed"
            disabled={!isLoggedIn}
            onClick={() => setIsCreateOpen(true)}
          >
            <MdAdd />
            <span className="sm:hidden">{t('forums.actions.post')}</span>
            <span className="hidden sm:inline">
              {t('forums.actions.newPost')}
            </span>
          </Button>
        </div>

        <div className="grid gap-3">
          {posts.map((post) => (
            <ForumPostListItem
              key={post.id}
              post={post}
              postPath={`${serverPath}/c/${channel.id}/posts/${post.id}`}
              isSelected={post.id === selectedPostId}
            />
          ))}
          {!isLoading && !posts.length && (
            <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center">
              {t('forums.prompts.noPosts')}
            </div>
          )}
          <div ref={listBottomRef} className="h-px" aria-hidden="true" />
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto md:w-full md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('forums.actions.createPost')}</DialogTitle>
            <DialogDescription>
              {t('forums.descriptions.createPost')}
            </DialogDescription>
          </DialogHeader>
          <ForumPostForm
            channel={channel}
            onSuccess={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
};
