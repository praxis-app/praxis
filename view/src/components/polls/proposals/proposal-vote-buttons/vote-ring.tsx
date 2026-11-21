export const VoteRing = () => (
  <svg
    aria-hidden="true"
    viewBox="-16 -16 32 32"
    className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 overflow-visible motion-reduce:hidden"
  >
    <circle
      r={8}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="motion-safe:animate-vote-ring origin-center opacity-0 transform-fill"
    />
  </svg>
);
