import { clsx, type ClassValue } from 'clsx';
import { t as translate } from 'i18next';
import { type Namespace, type TFunction } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

export interface Cancelable {
  clear(): void;
}

/**
 * Corresponds to 10 frames at 60 Hz.
 *
 * A few bytes payload overhead when lodash/debounce is ~3 kB and debounce ~300 B.
 *
 * Ref: https://github.com/mui/material-ui/blob/master/packages/mui-utils/src/debounce/debounce.ts
 */
export const debounce = <TThis, TArgs extends unknown[], TReturn>(
  func: (this: TThis, ...args: TArgs) => TReturn,
  wait = 166,
) => {
  let timeout: ReturnType<typeof setTimeout>;
  function debounced(this: TThis, ...args: TArgs) {
    const later = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }

  debounced.clear = () => {
    clearTimeout(timeout);
  };

  return debounced as ((this: TThis, ...args: TArgs) => TReturn) & Cancelable;
};

export const throttle = <TThis, TArgs extends unknown[], TReturn>(
  func: (this: TThis, ...args: TArgs) => TReturn,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;

  return function (this: TThis, ...args: TArgs) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      // Execute immediately if enough time has passed
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      // Schedule execution for later
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(
        () => {
          func.apply(this, args);
          lastExecTime = Date.now();
          timeoutId = null;
        },
        delay - (currentTime - lastExecTime),
      );
    }
  };
};

export const getWebSocketURL = () =>
  import.meta.env.DEV
    ? `ws://${window.location.hostname}:${import.meta.env.VITE_SERVER_PORT}/ws`
    : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`;

/**
 * Utility function for conditionally combining and merging CSS class names.
 * Combines clsx for conditional classes with twMerge to resolve Tailwind CSS conflicts
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * A wrapper around the i18next `t` function with type safety using the translation `Namespace` type.
 *
 * TODO: Remove this util and replace all instances with `useTranslation` hook
 * Ref: https://github.com/praxis-app/praxis-matrix-client/pull/7#pullrequestreview-3022541526
 */
export const t: TFunction<Namespace<'translation'>, undefined> = translate;
