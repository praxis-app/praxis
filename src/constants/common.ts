export const EXPIRES_IN = "90d";
export const SCROLL_DURATION = 350;

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

export enum ResourcePaths {
  Post = "/posts/",
  Motion = "/motions/",
  Group = "/groups/",
  User = "/users/",
  Roles = "/roles/",
}

export enum NavigationPaths {
  About = "/about",
  Edit = "/edit",
  Followers = "/followers",
  Following = "/following",
  Home = "/",
  Groups = "/groups",
  Invites = "/invites",
  LogIn = "/users/login",
  Members = "/members",
  Requests = "/requests",
  Roles = "/roles",
  Settings = "/settings",
  SignUp = "/users/signup",
  Users = "/users",
}

export enum FieldNames {
  Body = "body",
  Name = "name",
  Description = "description",
  Query = "query",
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

export enum DirectoryNames {
  Public = "public",
  Uploads = "uploads",
  Defaults = "defaults",
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
  Enter = "Enter",
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
  None = "",
}

export enum TruncationSizes {
  ExtraSmall = 30,
  Small = 40,
  Medium = 65,
  Large = 175,
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

export interface ToastNotification {
  title: string;
  status: ToastStatus;
}

export type ScrollDirection = "" | ScrollDirections.Up | ScrollDirections.Down;

export type ModalOpenState = ModelNames | "";

export type FormToggleState = ModelNames | "";
