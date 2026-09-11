import { useEffect, useEffectEvent, useState } from 'react';

const IN_VIEW_THRESHOLD = 50;

interface Options {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isLoadingMore,
  onLoadMore,
  rootMargin = `${IN_VIEW_THRESHOLD}px`,
}: Options) => {
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const loadMore = useEffectEvent(() => {
    if (hasNextPage && !isLoadingMore) {
      onLoadMore();
    }
  });

  useEffect(() => {
    if (!sentinel) return;

    if (!('IntersectionObserver' in window)) {
      loadMore();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, rootMargin, sentinel]);

  return setSentinel;
};
