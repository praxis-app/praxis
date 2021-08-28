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

// TODO: Add paths for other resources in follow up PR
export enum ResourcePaths {
  Post = "/posts/",
  Motion = "/motions/",
  Group = "/groups/",
  User = "/users/",
}

export enum NavigationPaths {
  Home = "/",
  Groups = "/groups",
  Invites = "/invites",
  Roles = "/roles",
  Users = "/users",
  LogIn = "/users/login",
  SignUp = "/users/signup",
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

export enum PageSizes {
  Min = 5,
  Max = 20,
  Default = 10,
}

export enum KeyCodes {
  Escape = "Escape",
}

export enum Events {
  Keydown = "keydown",
  Resize = "resize",
  Scroll = "scroll",
}

export enum ScrollDirections {
  Up = "up",
  Down = "down",
}

export enum FocusTargets {
  CommentFormTextField = "commentFormTextField",
}

export const INITIAL_PAGINATION_STATE: PaginationState = {
  currentPage: 0,
  pageSize: PageSizes.Default,
};

export const INITIAL_FEED_STATE: FeedState = {
  items: [],
  totalItems: 0,
  loading: false,
};
