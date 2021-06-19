export namespace Settings {
  export enum GroupSettings {
    NoAdmin = "no-admin",
    VotingType = "voting-type",
    VoteVerification = "vote-verification",
    RatificationThreshold = "ratification-threshold",
    ReservationsLimit = "reservations-limit",
    StandAsidesLimit = "stand-asides-limit",
    XToPass = "x-to-pass",
    XToBlock = "x-to-block",
  }

  export enum GroupDefaults {
    NoAdmin = "false",
    VotingType = "consensus",
    VoteVerification = "false",
    RatificationThreshold = "50",
    ReservationsLimit = "2",
    StandAsidesLimit = "2",
    XToPass = "2",
    XToBlock = "2",
  }

  export enum States {
    On = "true",
    Off = "false",
  }
}
