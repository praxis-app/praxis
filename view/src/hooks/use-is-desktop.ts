import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsDesktop() {
  // Reporting mobile first would mount desktop-only panels a step late
  const [isDesktop, setIsDesktop] = useState(
    () => window.innerWidth > MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsDesktop(window.innerWidth > MOBILE_BREAKPOINT);
    };

    mql.addEventListener('change', onChange);
    setIsDesktop(window.innerWidth > MOBILE_BREAKPOINT);

    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return isDesktop;
}
