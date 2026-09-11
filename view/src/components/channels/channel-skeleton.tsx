// TODO: Add more skeletons and ensure this is used only where it makes
// sense - is currently used anywhere a loading indicator is needed

import { useIsDesktop } from '@/hooks/use-is-desktop';
import { Skeleton } from '../ui/skeleton';

const MessageSkeleton = () => {
  const getRandomWidth = (min: number, max: number) => {
    return `${Math.floor(Math.random() * (max - min + 1) + min)}%`;
  };

  const showSecondBodyLine = Math.random() < 0.5;

  return (
    <div className="flex gap-2">
      <Skeleton className="h-10 min-w-10 rounded-full" />
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="h-4" style={{ width: getRandomWidth(30, 40) }} />
        <Skeleton className="h-4" style={{ width: getRandomWidth(70, 100) }} />

        {showSecondBodyLine && (
          <Skeleton
            className="h-4"
            style={{ width: getRandomWidth(80, 100) }}
          />
        )}
      </div>
    </div>
  );
};

const RoomFeedSkeleton = () => (
  <div className="mb-2 flex flex-col gap-6">
    {Array.from({ length: 5 }).map((_, index) => (
      <MessageSkeleton key={index} />
    ))}
  </div>
);

export const ChannelSkeleton = () => {
  const isDesktop = useIsDesktop();

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex gap-2.5 p-2.5">
      {isDesktop && <Skeleton className="h-full w-48" />}

      <div className="flex flex-1 flex-col justify-between gap-4">
        <Skeleton className="h-12 w-full" />

        <div className="flex flex-col gap-4">
          <RoomFeedSkeleton />

          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
};
