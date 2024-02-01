export enum VoteTypes {
  Agreement = 'agreement',
  Disagreement = 'disagreement',
  Reservations = 'reservations',
  StandAside = 'stand-aside',
  Block = 'block',
}

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
