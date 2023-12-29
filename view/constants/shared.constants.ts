// TODO: Update all enums to use singular names

export const API_ROOT = '/api';
export const TAB_QUERY_PARAM = '?tab=';

export const FORBIDDEN = 'Forbidden';
export const UNAUTHORIZED = 'Unauthorized';

export const ACCESS_TOKEN = 'access_token';

export const MIDDOT_WITH_SPACES = ' · ';
export const SCROLL_DURATION = 250;

export const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const DEFAULT_PAGE_SIZE = 10;

export enum NavigationPaths {
  About = '/about',
  Canary = '/canary',
  Docs = '/docs',
  Edit = '/edit',
  Events = '/events',
  Followers = '/followers',
  Following = '/following',
  Groups = '/groups',
  Home = '/',
  Invites = '/invites',
  LogIn = '/auth/login',
  Posts = '/posts',
  Proposals = '/proposals',
  Roles = '/roles',
  ServerSettings = '/settings',
  SignUp = '/auth/signup',
  Users = '/users',
}

export enum TypeNames {
  Event = 'Event',
  EventAttendee = 'EventAttendee',
  Group = 'Group',
  GroupMember = 'GroupMember',
  GroupRole = 'GroupRole',
  Image = 'Image',
  Like = 'Like',
  MemberRequest = 'MemberRequest',
  Post = 'Post',
  Proposal = 'Proposal',
  ServerInvite = 'ServerInvite',
  ServerRole = 'ServerRole',
  User = 'User',
}

export enum FieldNames {
  Body = 'body',
  Description = 'description',
  Email = 'email',
  Images = 'images',
  Name = 'name',
  Password = 'password',
  Query = 'query',
}

export enum ChangeType {
  Add = 'add',
  Remove = 'remove',
}

export enum Environments {
  Development = 'development',
  Production = 'production',
}

export enum LocalStorageKey {
  AccessToken = 'access_token',
  RowsPerPage = 'rows-per-page',
}

export enum BrowserEvents {
  Keydown = 'keydown',
  Resize = 'resize',
  Scroll = 'scroll',
}

export enum KeyCodes {
  Enter = 'Enter',
  Escape = 'Escape',
}

export enum Time {
  Minute = 60,
  Hour = 3600,
  Day = 86400,
  Week = 604800,
  Month = 2628000,
}

export enum TruncationSizes {
  ExtraSmall = 25,
  Small = 40,
  Medium = 65,
  Large = 175,
}
