import { cn } from '@/lib/shared.utils';
import { MdHowToVote } from 'react-icons/md';

interface Props {
  countedNonce: number;
}

export const VoteCountedIcon = ({ countedNonce }: Props) => (
  <span className="relative inline-flex">
    <span
      key={`drop-${countedNonce}`}
      className={cn(
        'inline-flex',
        countedNonce > 0 && 'motion-safe:animate-vote-counted-drop',
      )}
    >
      <MdHowToVote className="text-muted-foreground" />
    </span>
    {countedNonce > 0 && (
      <span
        key={`ring-${countedNonce}`}
        aria-hidden="true"
        data-testid="vote-counted-ring"
        className="border-vote-accent motion-safe:animate-vote-counted-ring pointer-events-none absolute inset-0 rounded-full border opacity-0 motion-reduce:hidden"
      />
    )}
  </span>
);
