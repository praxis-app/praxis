export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfWeek = (date: Date) =>
  addDays(startOfDay(date), -startOfDay(date).getDay());

export const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

export const eventEnd = (event: { startsAt: string; endsAt?: string | null }) =>
  new Date(event.endsAt || event.startsAt);

export const eventOverlapsRange = (
  event: { startsAt: string; endsAt?: string | null },
  from: Date,
  to: Date,
) => new Date(event.startsAt) < to && eventEnd(event) > from;

export const formatEventDateTime = (
  startsAt: string,
  endsAt?: string | null,
) => {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const startTime = time.format(start).toLowerCase();
  if (!end) return `${date} at ${startTime}`;
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay
    ? `${date} at ${startTime} - ${time.format(end).toLowerCase()}`
    : `${date} at ${startTime}`;
};

export const formatEventDuration = (
  startsAt: string,
  endsAt?: string | null,
) => {
  if (!endsAt) return null;
  let remainingMinutes = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000,
  );
  if (remainingMinutes <= 0) return null;

  const units = [
    { minutes: 30 * 24 * 60, label: 'mo' },
    { minutes: 7 * 24 * 60, label: 'w' },
    { minutes: 24 * 60, label: 'd' },
    { minutes: 60, label: 'h' },
    { minutes: 1, label: 'm' },
  ];
  const parts: string[] = [];

  for (const unit of units) {
    const value = Math.floor(remainingMinutes / unit.minutes);
    if (!value) continue;
    parts.push(`${value}${unit.label}`);
    remainingMinutes %= unit.minutes;
    if (parts.length === 2) break;
  }

  return parts.join(' ');
};

export const parseDateValue = (value: string) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const toDateValue = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const toLocalDateTimeValue = (date: Date) =>
  `${toDateValue(date)}T${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;

export const getNextHourDateTimeValue = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toLocalDateTimeValue(date);
};

export const addHoursToDateTimeValue = (value: string, hours: number) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  date.setHours(date.getHours() + hours);
  return toLocalDateTimeValue(date);
};

export const formatDateValue = (value: string) => {
  const date = parseDateValue(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatTimeValue = (value: string) => {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, hour, minute));
};

export const getCalendarDays = (month: Date) => {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      value: toDateValue(date),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
};

export const getTimeOptions = () =>
  Array.from({ length: 96 }, (_, index) => {
    const hour = Math.floor(index / 4);
    const minute = (index % 4) * 15;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    return { value, label: formatTimeValue(value) };
  });

export const getNearestTimeValue = () => {
  const now = new Date();
  const minutes =
    Math.round((now.getHours() * 60 + now.getMinutes()) / 15) * 15;
  const normalizedMinutes = minutes % (24 * 60);
  return `${String(Math.floor(normalizedMinutes / 60)).padStart(2, '0')}:${String(normalizedMinutes % 60).padStart(2, '0')}`;
};
