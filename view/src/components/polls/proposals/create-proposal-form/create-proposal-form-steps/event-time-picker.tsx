import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  formatTimeValue,
  getNearestTimeValue,
  getTimeOptions,
} from '@/lib/event.utils';
import { cn } from '@/lib/shared.utils';
import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

const timeOptions = getTimeOptions();

export const EventTimePicker = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      const options = optionsRef.current;
      const target = options?.querySelector<HTMLElement>(
        `[data-time-value="${value || getNearestTimeValue()}"]`,
      );
      if (!options || !target) return;
      options.scrollTop =
        target.offsetTop - options.clientHeight / 2 + target.clientHeight / 2;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, value]);

  const selectTime = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-label={label}
          className="bg-muted/30 hover:bg-muted/50 h-12 w-full justify-start rounded-xl px-4 text-base font-normal sm:h-14"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {formatTimeValue(value) || placeholder}
          </span>
          <LuChevronDown className="text-muted-foreground ml-auto size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-(--radix-popover-trigger-width) min-w-44 rounded-xl p-1 shadow-xl"
      >
        <div ref={optionsRef} className="max-h-64 overflow-y-auto p-1">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              data-time-value={option.value}
              onClick={() => selectTime(option.value)}
              className={cn(
                'hover:bg-accent focus-visible:bg-accent flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm outline-none',
                value === option.value && 'bg-accent font-medium',
              )}
            >
              {option.label}
              {value === option.value && <LuCheck className="ml-auto size-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
