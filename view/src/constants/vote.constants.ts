export const VOTE_TYPES = ['agree', 'disagree', 'abstain', 'block'] as const;

export enum VotingTimeLimit {
  Unlimited = 0,
  OneMinute = 1,
  HalfHour = 30,
  OneHour = 60,
  HalfDay = 60 * 12,
  OneDay = 60 * 24,
  ThreeDays = 60 * 24 * 3,
  OneWeek = 60 * 24 * 7,
  TwoWeeks = 60 * 24 * 14,
}
