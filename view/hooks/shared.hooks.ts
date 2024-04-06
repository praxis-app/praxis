import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { BrowserEvents } from '../constants/shared.constants';

const RESET_SCROLL_DIRECTION_TIMEOUT = 700;
const RESET_SCROLL_DIRECTION_THRESHOLD = 40;

export type ScrollDirection = 'up' | 'down' | null;

export const useScrollDirection = () => {
  const [direction, setDirection] = useState<ScrollDirection>(null);
  const previousScrollY = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    previousScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (previousScrollY.current > window.scrollY) {
        setDirection('up');
      } else if (previousScrollY.current < window.scrollY) {
        setDirection('down');
      }
      previousScrollY.current = window.scrollY;

      if (window.scrollY < RESET_SCROLL_DIRECTION_THRESHOLD) {
        timeout = setTimeout(
          () => setDirection(null),
          RESET_SCROLL_DIRECTION_TIMEOUT,
        );
      }
    };

    window.addEventListener(BrowserEvents.Scroll, handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(BrowserEvents.Scroll, handleScroll);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return direction;
};

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener(BrowserEvents.Scroll, handleScroll, {
      passive: true,
    });
    return () => {
      window.removeEventListener(BrowserEvents.Scroll, handleScroll);
    };
  }, []);

  return scrollPosition;
};

export const useInView = (ref: RefObject<HTMLElement>, rootMargin = '0px') => {
  const [inView, setInView] = useState(false);
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    const isBrowserCompatible = 'IntersectionObserver' in window;
    if (!isBrowserCompatible) {
      setInView(true);
      setViewed(true);
      return;
    }
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setViewed(true);
        }
        setInView(entry.isIntersecting);
      },
      { rootMargin },
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return [inView, viewed];
};

export const useAboveBreakpoint = (breakpoint: Breakpoint) =>
  useMediaQuery(useTheme().breakpoints.up(breakpoint));

export const useIsDesktop = () => useAboveBreakpoint('md');
