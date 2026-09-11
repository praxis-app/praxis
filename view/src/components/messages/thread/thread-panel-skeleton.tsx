import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const MessageSkeleton = ({ short = false }: { short?: boolean }) => (
  <div className="flex gap-4">
    <Skeleton className="size-10 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className={short ? 'h-4 w-2/3' : 'h-4 w-full'} />
      {!short && <Skeleton className="h-4 w-4/5" />}
    </div>
  </div>
);

export const ThreadPanelSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t('messages.threads.loading')}
      className="px-4 pt-5 pb-4"
    >
      <div aria-hidden="true">
        <MessageSkeleton />

        <div className="my-5 flex items-center gap-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-px flex-1 rounded-none" />
        </div>

        <div className="space-y-5">
          <MessageSkeleton short />
          <MessageSkeleton />
        </div>
      </div>
    </div>
  );
};
