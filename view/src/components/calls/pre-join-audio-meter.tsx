import { cn } from '@/lib/shared.utils';

interface Props {
  enabled: boolean;
  label: string;
  level: number;
}

const barCount = 18;
const bars = Array.from({ length: barCount }, (_, index) => index);

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const PreJoinAudioMeter = ({ enabled, label, level }: Props) => {
  const normalizedLevel = enabled ? clamp(level / 100) : 0;
  const displayLevel = enabled ? Math.round(level) : 0;

  return (
    <>
      <meter
        aria-label={label}
        className="sr-only"
        max={100}
        min={0}
        value={displayLevel}
      />
      <div className="border-border/70 bg-background/70 flex h-10 items-end gap-1 rounded-md border px-3 py-2">
        {bars.map((bar) => {
          const barStart = bar / barCount;
          const intensity = clamp((normalizedLevel - barStart) * barCount);
          const height = enabled ? 24 + intensity * 76 : 20;

          return (
            <span
              aria-hidden="true"
              className={cn(
                'bg-primary/25 block min-h-1 flex-1 rounded-full transition-[height,opacity,background-color] duration-150 ease-out',
                intensity > 0 && 'bg-primary',
              )}
              key={bar}
              style={{
                height: `${height}%`,
                opacity: enabled ? 0.28 + intensity * 0.72 : 0.18,
              }}
            />
          );
        })}
      </div>
    </>
  );
};
