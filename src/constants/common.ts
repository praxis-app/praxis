export namespace Common {
  export const PAGE_SIZE = 10;
  export const EXPIRES_IN = "90d";
  export const DESKTOP_BREAKPOINT = 850;

  export enum TypeNames {
    Comment = "Comment",
    CurrentUser = "CurrentUser",
    FeedItem = "FeedItem",
    Follow = "Follow",
    Group = "Group",
    Image = "Image",
    Like = "Like",
    Motion = "Motion",
    Permission = "Permission",
    Post = "Post",
    Role = "Role",
    Setting = "Setting",
    ServerInvite = "ServerInvite",
    User = "User",
    Vote = "Vote",
  }

  export enum ModelNames {
    Comment = "comment",
    Follow = "follow",
    Group = "group",
    Image = "image",
    Like = "like",
    Motion = "motion",
    Post = "post",
    Role = "role",
    Setting = "setting",
    User = "user",
    Vote = "vote",
  }

  export enum FieldNames {
    Body = "body",
    Name = "name",
    Description = "description",
  }

  export enum LocalStorage {
    JwtToken = "jwtToken",
    WelcomeCardClosed = "welcomeCardClosed",
    RedeemedInviteToken = "redeemedInviteToken",
  }

  export enum Environments {
    Development = "development",
    Production = "production",
  }

  export enum Time {
    Minute = 60,
    Hour = 3600,
    Day = 86400,
    Week = 604800,
    Month = 2628000,
  }

  export enum ToastStatus {
    Success = "success",
    Error = "error",
    Info = "info",
    Warning = "warning",
  }
}
