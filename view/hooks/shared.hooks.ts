import { useReactiveVar } from '@apollo/client';
import { Breakpoint, useMediaQuery, useTheme } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { BrowserEvents } from '../constants/shared.constants';
import { scrollDirectionVar } from '../graphql/cache';

const RESET_SCROLL_DIRECTION_TIMEOUT = 700;
const RESET_SCROLL_DIRECTION_THRESHOLD = 40;

export type ScrollDirection = 'up' | 'down' | null;

export const useScrollDirection = () => {
  const scrollPosition = useReactiveVar(scrollDirectionVar);
  const previousScrollY = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    previousScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (previousScrollY.current > window.scrollY) {
        scrollDirectionVar('up');
      } else if (previousScrollY.current < window.scrollY) {
        scrollDirectionVar('down');
      }
      previousScrollY.current = window.scrollY;

      if (window.scrollY < RESET_SCROLL_DIRECTION_THRESHOLD) {
        timeout = setTimeout(
          () => scrollDirectionVar(null),
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

  return scrollPosition;
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

  return { inView, setInView, viewed, setViewed };
};

export const useWindowSize = () => {
  const { clientWidth, clientHeight } = document.body;
  const [windowWidth, setWindowWidth] = useState(clientWidth);
  const [windowHeight, setWindowHeight] = useState(clientHeight);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowWidth(document.body.clientWidth);
      setWindowHeight(document.body.clientHeight);
    };

    window.addEventListener(BrowserEvents.Resize, handleWindowResize);

    return () => {
      window.removeEventListener(BrowserEvents.Resize, handleWindowResize);
    };
  }, []);

  return [windowWidth, windowHeight];
};

export const useAboveBreakpoint = (breakpoint: Breakpoint) =>
  useMediaQuery(useTheme().breakpoints.up(breakpoint));

export const useIsDesktop = () => useAboveBreakpoint('md');
