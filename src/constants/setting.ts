export namespace Settings {
  export enum GroupSettings {
    NoAdmin = "no-admin",
    VotingType = "voting-type",
    VoteVerification = "vote-verification",
    RatificationThreshold = "ratification-threshold",
    XToPass = "x-to-pass",
    XToBlock = "x-to-block",
  }

  export enum GroupDefaults {
    NoAdmin = "false",
    VotingType = "consensus",
    VoteVerification = "false",
    RatificationThreshold = "50",
    XToPass = "2",
    XToBlock = XToPass,
  }

  export enum States {
    On = "true",
    Off = "false",
  }
}
