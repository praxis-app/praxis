import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { DESKTOP_BREAKPOINT, Events } from "../constants/common";

// TODO: Use useIsMountedRef to resolve the following warning:
// Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function
// Solution found here: https://www.debuggr.io/react-update-unmounted-component
// Please close the following issue once all warnings have been resolved:
// https://github.com/forrestwilkins/praxis/issues/26

export const useIsMountedRef = (): MutableRefObject<boolean | null> => {
  const isMountedRef = useRef<boolean | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    updateSize();
    window.addEventListener(Events.Resize, updateSize);
    return () => window.removeEventListener(Events.Resize, updateSize);
  }, []);

  return size;
};

export const useIsDesktop = (): boolean => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up(DESKTOP_BREAKPOINT));
  return isDesktop;
};
