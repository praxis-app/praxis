import { useEffect, useState } from 'react';
import { type RefObject } from 'react';

export const useInView = (
  ref: RefObject<HTMLElement | null>,
  rootMargin = '0px',
  onView?: () => void,
) => {
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
          onView?.();
        }
        setInView(entry.isIntersecting);
      },
      { rootMargin },
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin, onView]);

  return { inView, setInView, viewed, setViewed };
};
