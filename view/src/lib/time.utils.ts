import { Time } from '@/constants/shared.constants';
import dayjs from 'dayjs';
import { t } from './shared.utils';

/** Compact ("5m"), counting down ("Ends in 5 minutes"), or elapsed ("Ended 5 minutes ago") */
export type TimeMessageVariant = 'compact' | 'endsIn' | 'ended';

const VARIANT_KEYS = {
  compact: {
    minutes: 'time.minutes',
    hours: 'time.hours',
    days: 'time.days',
  },
  endsIn: {
    minutes: 'time.minutesEndsIn',
    hours: 'time.hoursEndsIn',
    days: 'time.daysEndsIn',
  },
  ended: {
    minutes: 'time.minutesEnded',
    hours: 'time.hoursEnded',
    days: 'time.daysEnded',
  },
} as const;

export const formatDate = (timeStamp: string) =>
  dayjs(timeStamp).format('MMMM D, YYYY');

export const timeMessage = (
  timeStamp: string,
  timeDifference: number,
  variant: TimeMessageVariant = 'compact',
) => {
  const keys = VARIANT_KEYS[variant];

  if (timeDifference < Time.Minute) {
    const minutes = 1;
    return t(keys.minutes, { count: minutes, minutes });
  }
  if (timeDifference < Time.Hour) {
    const minutes = Math.round(timeDifference / Time.Minute);
    return t(keys.minutes, { count: minutes, minutes });
  }
  if (timeDifference < Time.Day) {
    const hours = Math.round(timeDifference / Time.Hour);
    return t(keys.hours, { count: hours, hours });
  }
  if (timeDifference < Time.Month) {
    const days = Math.round(timeDifference / Time.Day);
    return t(keys.days, { count: days, days });
  }
  if (variant === 'ended') {
    return t('time.endedOn', { date: formatDate(timeStamp) });
  }
  return formatDate(timeStamp);
};

/** Like `timeAgo`, but falls back to a compact date instead of a full one */
export const shortTimeAgo = (timeStamp: string) => {
  const secondsPast =
    (new Date().getTime() - new Date(timeStamp).getTime()) / 1000;
  if (secondsPast < Time.Month) {
    return timeMessage(timeStamp, secondsPast);
  }
  const date = dayjs(timeStamp);
  return date.isSame(dayjs(), 'year')
    ? date.format('MMM D')
    : date.format('MMM D, YYYY');
};

export const timeAgo = (timeStamp: string) => {
  const now = new Date().getTime();
  const time = new Date(timeStamp).getTime();
  const secondsPast = (now - time) / 1000;
  return timeMessage(timeStamp, secondsPast);
};

export const lastReplyTime = (timeStamp: string) => {
  const replyDate = dayjs(timeStamp);
  const now = dayjs();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(replyDate.toDate());

  if (replyDate.isSame(now, 'day')) {
    return t('messages.labels.lastReplyToday', { time });
  }
  if (replyDate.isSame(now.subtract(1, 'day'), 'day')) {
    return t('messages.labels.lastReplyYesterday', { time });
  }

  const date = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(replyDate.year() !== now.year() && { year: 'numeric' }),
  }).format(replyDate.toDate());
  return t('messages.labels.lastReplyOn', { date, time });
};

/** A deadline as a compact date and time, e.g. "Sep 8 at 1:36 AM" */
export const formatDeadline = (timeStamp: string) => {
  const deadline = dayjs(timeStamp);
  const date = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(deadline.year() !== dayjs().year() && { year: 'numeric' }),
  }).format(deadline.toDate());
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(deadline.toDate());
  return t('time.dateAtTime', { date, time });
};

export const timeFromNow = (timeStamp: string, endsIn = false) => {
  const now = new Date().getTime();
  const time = new Date(timeStamp).getTime();
  const secondsFromNow = (time - now) / 1000;
  return timeMessage(timeStamp, secondsFromNow, endsIn ? 'endsIn' : 'compact');
};

/** How long ago a deadline elapsed, e.g. "Ended 5 minutes ago" */
export const timeSinceEnded = (timeStamp: string) => {
  const now = new Date().getTime();
  const time = new Date(timeStamp).getTime();
  const secondsSinceEnded = (now - time) / 1000;
  return timeMessage(timeStamp, secondsSinceEnded, 'ended');
};
