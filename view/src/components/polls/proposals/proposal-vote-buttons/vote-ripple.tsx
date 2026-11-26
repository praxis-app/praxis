import { VOTE_RIPPLE } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { type VoteRipple as VoteRippleData } from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.types';
import { cn } from '@/lib/shared.utils';

interface Props {
  ripple: VoteRippleData;
}

export const VoteRipple = ({ ripple }: Props) => (
  <span
    data-testid="vote-ripple"
    className={cn(
      'pointer-events-none absolute -z-10 transition-opacity ease-out motion-reduce:hidden',
      ripple.isReleased && 'opacity-0',
    )}
    style={{
      left: ripple.x - ripple.size / 2,
      top: ripple.y - ripple.size / 2,
      width: ripple.size,
      height: ripple.size,
      transitionDuration: `${VOTE_RIPPLE.fadeMs}ms`,
    }}
  >
    <span
      className="animate-vote-ripple-expand block size-full rounded-full bg-[radial-gradient(circle_closest-side,var(--vote-ripple-center),var(--vote-ripple-edge)_var(--vote-ripple-edge-stop),transparent)]"
      style={{ animationDuration: `${VOTE_RIPPLE.expandMs}ms` }}
    />
  </span>
);
