export namespace Common {
  export const PAGE_SIZE = 10;
  export const EXPIRES_IN = "90d";

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

  export enum LocalStorage {
    JwtToken = "jwtToken",
    WelcomeCardClosed = "welcomeCardClosed",
  }

  export enum Environments {
    Development = "development",
    Production = "production",
  }
}
