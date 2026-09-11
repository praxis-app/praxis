import { Skeleton } from '@/components/ui/skeleton';

const ChannelListItemSkeleton = ({ width }: { width: string }) => (
  <div className="mx-2 flex items-center gap-2 rounded-lg py-[0.225rem] pl-2">
    <Skeleton className="size-6 shrink-0 rounded-full" />
    <Skeleton className="h-4" style={{ width }} />
  </div>
);

const ITEM_WIDTHS = ['70%', '45%', '60%', '35%', '55%'];

export const ChannelListSkeleton = () => (
  <div
    className="flex flex-1 flex-col gap-2 overflow-y-hidden py-2"
    data-testid="channel-list-skeleton"
  >
    {ITEM_WIDTHS.map((width, index) => (
      <ChannelListItemSkeleton key={index} width={width} />
    ))}
  </div>
);
