import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/shared.utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuCalendarDays, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import {
  formatDateValue,
  getCalendarDays,
  parseDateValue,
  toDateValue,
} from '@/lib/event.utils';

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: Date;
}

const weekdays = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
    new Date(2024, 0, 7 + index),
  ),
);

export const EventDatePicker = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  minDate,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    parseDateValue(value) || new Date(),
  );
  const { t } = useTranslation();
  const todayValue = toDateValue(new Date());
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);
  const calendarDays = getCalendarDays(visibleMonth);
  const minDateValue = minDate ? toDateValue(minDate) : undefined;

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1),
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setVisibleMonth(parseDateValue(value) || new Date());
    setOpen(nextOpen);
  };

  const selectDate = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={label}
          className="bg-muted/30 hover:bg-muted/50 h-12 w-full justify-start rounded-xl px-4 text-base font-normal sm:h-14"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {formatDateValue(value) || placeholder}
          </span>
          <LuCalendarDays className="text-muted-foreground ml-auto size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] rounded-xl p-3 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between border-b pb-3">
          <p className="font-semibold">{monthLabel}</p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('events.actions.previousMonth')}
              onClick={() => changeMonth(-1)}
            >
              <LuChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('events.actions.nextMonth')}
              onClick={() => changeMonth(1)}
            >
              <LuChevronRight />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="text-muted-foreground flex h-8 items-center justify-center text-xs font-semibold uppercase"
            >
              {weekday}
            </div>
          ))}
          {calendarDays.map((day) => (
            <button
              key={day.value}
              type="button"
              aria-label={new Intl.DateTimeFormat(undefined, {
                dateStyle: 'full',
              }).format(day.date)}
              aria-pressed={day.value === value}
              disabled={!!minDateValue && day.value < minDateValue}
              onClick={() => selectDate(day.value)}
              className={cn(
                'hover:bg-accent focus-visible:ring-ring flex aspect-square items-center justify-center rounded-md text-sm font-medium outline-none focus-visible:ring-2',
                'disabled:pointer-events-none disabled:opacity-35',
                !day.isCurrentMonth && 'text-muted-foreground/50',
                day.value === todayValue && 'border-primary/60 border',
                day.value === value &&
                  'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {day.date.getDate()}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!value}
            onClick={() => selectDate('')}
          >
            {t('events.actions.clear')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!!minDateValue && todayValue < minDateValue}
            onClick={() => selectDate(todayValue)}
          >
            {t('events.actions.today')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
