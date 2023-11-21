import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useEffect, useMemo, useState } from 'react';
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

export const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting),
      ),
    [],
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, observer]);

  return isIntersecting;
};
