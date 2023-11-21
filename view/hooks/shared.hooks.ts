import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useEffect, useState } from 'react';
import { BrowserEvents } from '../constants/shared.constants';

export const useAboveBreakpoint = (breakpoint: Breakpoint) =>
  useMediaQuery(useTheme().breakpoints.up(breakpoint));

export const useIsDesktop = () => useAboveBreakpoint('md');

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

  useEffect(() => {
    const isBrowserCompatible = 'IntersectionObserver' in window;
    if (!ref.current || !isBrowserCompatible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);

  return inView;
};
