import { Label } from '@/components/ui/label';
import { useEffect, useId, useState } from 'react';
import { EventDatePicker } from './event-date-picker';
import { EventTimePicker } from './event-time-picker';

interface Props {
  dateLabel: string;
  datePlaceholder: string;
  timeLabel: string;
  timePlaceholder: string;
  value?: string;
  onChange: (value: string) => void;
  minDate?: Date;
}

const getDateTimeParts = (value?: string) => {
  const [date = '', time = ''] = value?.split('T') || [];
  return { date, time: time.slice(0, 5) };
};

export const EventDateTimeField = ({
  dateLabel,
  datePlaceholder,
  timeLabel,
  timePlaceholder,
  value,
  onChange,
  minDate,
}: Props) => {
  const initialParts = getDateTimeParts(value);
  const [date, setDate] = useState(initialParts.date);
  const [time, setTime] = useState(initialParts.time);
  const id = useId();

  useEffect(() => {
    const nextParts = getDateTimeParts(value);
    setDate(nextParts.date);
    setTime(nextParts.time);
  }, [value]);

  const updateValue = (nextDate: string, nextTime: string) => {
    setDate(nextDate);
    setTime(nextTime);
    onChange(nextDate || nextTime ? `${nextDate}T${nextTime}` : '');
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="min-w-0 space-y-2">
        <Label htmlFor={`${id}-date`} className="text-sm font-semibold">
          {dateLabel}
        </Label>
        <EventDatePicker
          id={`${id}-date`}
          label={dateLabel}
          placeholder={datePlaceholder}
          value={date}
          minDate={minDate}
          onChange={(nextDate) => updateValue(nextDate, time)}
        />
      </div>
      <div className="min-w-0 space-y-2">
        <Label htmlFor={`${id}-time`} className="text-sm font-semibold">
          {timeLabel}
        </Label>
        <EventTimePicker
          id={`${id}-time`}
          label={timeLabel}
          placeholder={timePlaceholder}
          value={time}
          onChange={(nextTime) => updateValue(date, nextTime)}
        />
      </div>
    </div>
  );
};
