import {
  BURST_PARTICLE_ANGLE_OFFSET,
  BURST_STROKE_CLASS_NAMES,
} from '@/components/polls/proposals/proposal-vote-buttons/vote-animation.constants';
import { cn } from '@/lib/shared.utils';

interface Props {
  isLarge?: boolean;
}

interface Particle {
  angle: number;
  innerRadius: number;
  outerRadius: number;
  strokeClassName: string;
}

const getParticles = (isLarge: boolean): Particle[] => {
  const count = isLarge ? 10 : 5;
  const [strokeA, strokeB] = isLarge
    ? BURST_STROKE_CLASS_NAMES.ratify
    : BURST_STROKE_CLASS_NAMES.agree;
  const step = 360 / count;

  return Array.from({ length: count }, (_, index) => {
    const isAlternate = index % 2 === 1;
    const reachesFurther = isLarge && isAlternate;
    return {
      angle: index * step + BURST_PARTICLE_ANGLE_OFFSET,
      innerRadius: reachesFurther ? 11 : 9,
      outerRadius: reachesFurther ? 21 : isLarge ? 16 : 14,
      strokeClassName: isAlternate ? strokeB : strokeA,
    };
  });
};

export const VoteBurst = ({ isLarge = false }: Props) => {
  const half = isLarge ? 24 : 16;
  const particles = getParticles(isLarge);

  return (
    <svg
      aria-hidden="true"
      viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
      className={cn(
        'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible motion-reduce:hidden',
        isLarge ? 'size-12' : 'size-8',
      )}
    >
      {particles.map(({ angle, innerRadius, outerRadius, strokeClassName }) => (
        <line
          key={angle}
          x1={0}
          y1={-innerRadius}
          x2={0}
          y2={-outerRadius}
          transform={`rotate(${angle})`}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          className={cn(strokeClassName, 'motion-safe:animate-vote-particle')}
        />
      ))}
    </svg>
  );
};
