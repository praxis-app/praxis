import { BrowserEvents } from '@/constants/shared.constants';
import { type RefObject, useEffect, useRef, useState } from 'react';

const RESET_SCROLL_DIRECTION_TIMEOUT = 800;

type ScrollDirection = 'up' | 'down' | null;

export const useScrollDirection = (
  scrollableRef: RefObject<HTMLElement | null>,
  resetTimeout = RESET_SCROLL_DIRECTION_TIMEOUT,
) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const previousScrollTop = useRef(0);

  useEffect(() => {
    if (!scrollableRef.current) {
      return;
    }

    const scrollableCopy = scrollableRef.current;

    // Initialize with the current scroll position
    previousScrollTop.current = scrollableCopy.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = scrollableCopy.scrollTop;

      if (previousScrollTop.current > currentScrollTop) {
        setScrollDirection('up');
      } else if (previousScrollTop.current < currentScrollTop) {
        setScrollDirection('down');
      }

      previousScrollTop.current = currentScrollTop;
    };

    scrollableCopy.addEventListener(BrowserEvents.Scroll, handleScroll, {
      passive: true,
    });

    return () => {
      if (scrollableCopy) {
        scrollableCopy.removeEventListener(BrowserEvents.Scroll, handleScroll);
      }
    };
  }, [scrollableRef, resetTimeout]);

  return scrollDirection;
};
