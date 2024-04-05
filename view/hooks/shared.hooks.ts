import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { BrowserEvents } from '../constants/shared.constants';

export type ScrollDirection = 'up' | 'down' | undefined;

export const useScrollDirection = () => {
  const [direction, setDirection] = useState<ScrollDirection>();
  const previousScrollY = useRef(0);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (previousScrollY.current > window.scrollY) {
        setDirection('up');
      } else if (previousScrollY.current < window.scrollY) {
        setDirection('down');
      }
      previousScrollY.current = window.scrollY;
    };
    window.addEventListener(BrowserEvents.Scroll, handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener(BrowserEvents.Scroll, handleScroll);
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
