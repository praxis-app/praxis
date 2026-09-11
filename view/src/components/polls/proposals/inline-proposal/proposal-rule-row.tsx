import { cn } from '@/lib/shared.utils';

interface Props {
  label: string;
  value: string;
  met: boolean;
  pending?: boolean;
}

export const ProposalRuleRow = ({ label, value, met, pending }: Props) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="font-medium">{label}</div>
      <div className="text-muted-foreground">{value}</div>
    </div>
    <span
      className={cn(
        pending && 'text-muted-foreground',
        !pending && met && 'text-green-600 dark:text-green-400',
        !pending && !met && 'text-destructive',
      )}
      aria-label={pending ? 'pending' : met ? 'met' : 'not met'}
    >
      {pending ? '–' : met ? '✓' : '✕'}
    </span>
  </div>
);
