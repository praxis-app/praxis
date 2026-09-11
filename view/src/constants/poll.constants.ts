export const DECISION_MAKING_MODEL = [
  'consent',
  'consensus',
  'majority-vote',
] as const;

export const POLL_STAGE = ['voting', 'ratified', 'revision', 'closed'] as const;

export const POLL_TYPE = ['proposal', 'poll'] as const;

export const POLL_BODY_MAX = 6000;
