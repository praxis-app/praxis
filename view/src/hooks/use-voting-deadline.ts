import { useEffect, useState } from 'react';

const deadlineHasPassed = (closingAt?: string) =>
  !!closingAt && Date.now() >= new Date(closingAt).getTime();

export const useVotingDeadline = (closingAt?: string) => {
  const [hasPassed, setHasPassed] = useState(() =>
    deadlineHasPassed(closingAt),
  );

  useEffect(() => {
    setHasPassed(deadlineHasPassed(closingAt));
    if (!closingAt) return;

    const deadline = new Date(closingAt).getTime();
    let timeout: number | undefined;
    const scheduleDeadline = () => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setHasPassed(true);
        return;
      }
      timeout = window.setTimeout(
        scheduleDeadline,
        Math.min(remaining, 2_147_483_647),
      );
    };
    scheduleDeadline();
    return () => window.clearTimeout(timeout);
  }, [closingAt]);

  return hasPassed;
};
