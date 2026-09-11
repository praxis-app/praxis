import { Time } from '@/constants/shared.constants';
import { useVotingDeadline } from '@/hooks/use-voting-deadline';
import { timeFromNow, timeSinceEnded } from '@/lib/time.utils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const getRefreshDelay = (closingAt: string) => {
  const distance = Math.abs(new Date(closingAt).getTime() - Date.now()) / 1000;
  if (distance < Time.Hour) {
    return 10 * 1000;
  }
  if (distance < Time.Day) {
    return 60 * 1000;
  }
  return 5 * 60 * 1000;
};

const isWithinRelativeRange = (closingAt: string) =>
  Math.abs(new Date(closingAt).getTime() - Date.now()) / 1000 < Time.Month;

/**
 * Live label for a deadline: counts down while voting is open, then reports how
 * long ago it ended. `label` is null when there is no deadline
 */
export const useVotingDeadlineLabel = (
  closingAt?: string,
  isActive = true,
): { hasEnded: boolean; label: string | null } => {
  const [, setTick] = useState(0);

  const hasPassed = useVotingDeadline(closingAt);
  const { t } = useTranslation();

  const hasEnded = !isActive || hasPassed;

  useEffect(() => {
    if (!closingAt || !isWithinRelativeRange(closingAt)) {
      return;
    }
    let timeout: number | undefined;
    const scheduleRefresh = () => {
      timeout = window.setTimeout(() => {
        if (!isWithinRelativeRange(closingAt)) {
          return;
        }
        setTick((tick) => tick + 1);
        scheduleRefresh();
      }, getRefreshDelay(closingAt));
    };
    scheduleRefresh();
    return () => window.clearTimeout(timeout);
  }, [closingAt]);

  if (hasEnded) {
    // A deadline that has not elapsed says nothing about when voting ended
    return {
      hasEnded,
      label:
        hasPassed && closingAt ? timeSinceEnded(closingAt) : t('time.ended'),
    };
  }
  return {
    hasEnded,
    label: closingAt ? timeFromNow(closingAt, true) : null,
  };
};
